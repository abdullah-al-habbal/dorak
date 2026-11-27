<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Client\Services\ClientEmailVerificationCodes;
use Modules\Client\Services\ClientPhoneOtpCodes;
use Modules\Client\Services\PasswordResetCodeVerifier;
use Modules\Core\Enums\TokenAbility;
use Modules\Core\Services\OneTimeCodes;
use Modules\Core\Services\StaffPasswordResetCodes;
use Modules\Dashboard\Eloquent\Resolvers\Profile\DashboardEmailChangeEloquentResolver;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardSessionClaim;
use Modules\Settings\Constants\SettingsConstants;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

require_once dirname(__DIR__).'/Support/concurrency-helpers.php';

/**
 * BG-28: a one-time code works once, and the attempt budget holds against parallel guesses. The test locks the row
 * that holds the code (the cache row on the shared database store, or the pending email change), so a request that
 * has already read the code stops where it deletes or rewrites it: without a lock around the whole verification every
 * parallel request gets that far and succeeds.
 */
const CONCURRENCY_CACHE = ['CACHE_STORE' => 'database'];

const CONCURRENCY_CODE_SESSION_SECRET = 'concurrency-session-secret-at-least-thirty-two-characters';

const CONCURRENCY_CODE_NEW_PASSWORD = 'a-new-password-for-the-race-789';

beforeEach(function (): void {
    config(['cache.default' => 'database']);
    Cache::forgetDriver('database');
});

afterEach(function (): void {
    while (DB::transactionLevel() > 0) {
        DB::commit();
    }
    DB::purge('concurrency_locker');
    Artisan::call('migrate:fresh', ['--force' => true]);
});

/**
 * Sends the requests one after another while the code's row is locked, then releases it.
 *
 * @param  array{table: string, column: string, value: string, uri: string, token: string, headers: array<string, string>, env: array<string, string>}  $flow
 * @param  list<string>  $codes  one request per code, in this order
 */
function concurrencyAgainstHeldCode(array $flow, array $codes): array
{
    $locker = concurrencyLocker();
    $locker->beginTransaction();
    $row = $locker->table($flow['table'])->where($flow['column'], $flow['value'])->lockForUpdate()->first();
    expect($row)->not->toBeNull();

    try {
        $workers = [];
        foreach ($codes as $code) {
            $worker = concurrencyStart('POST', $flow['uri'], $flow['token'], [...$flow['body'], 'code' => $code], $flow['headers'], $flow['env']);
            $workers[] = $worker;
            // Each request gets time to reach the held row (or to queue behind the one that did), in this order.
            $worker->waitUntil(fn (string $type, string $output): bool => str_contains($output, 'READY'));
            usleep(500_000);
        }
    } finally {
        $locker->rollBack();
    }

    return array_map('concurrencyFinish', $workers);
}

/**
 * A flow that waits on a code, with the code `123456` pending.
 *
 * @return array{table: string, column: string, value: string, uri: string, token: string, body: array<string, string>, headers: array<string, string>, env: array<string, string>, budget: SettingKey, accepted: Closure(): bool}
 */
function concurrencyCodeFlow(string $name): array
{
    $cached = fn (string $key): array => ['table' => 'cache', 'column' => 'key', 'value' => config('cache.prefix').$key, 'token' => '', 'body' => [], 'headers' => [], 'env' => CONCURRENCY_CACHE];
    $passwordBody = fn (string $email): array => ['email' => $email, 'password' => CONCURRENCY_CODE_NEW_PASSWORD, 'password_confirmation' => CONCURRENCY_CODE_NEW_PASSWORD];
    $passwordChanged = fn (Model $account): Closure => fn (): bool => Hash::check(CONCURRENCY_CODE_NEW_PASSWORD, (string) $account->fresh()->getAttribute('password'));

    return match ($name) {
        'phone code' => (function () use ($cached): array {
            $client = ClientModel::factory()->create(['phone_verified_at' => null]);
            app(ClientPhoneOtpCodes::class)->issue((string) $client->id, '+963911222333', '123456');

            return [...$cached("phone_otp_{$client->id}"), 'uri' => '/api/v1/client/phone/verify',
                'token' => $client->createToken('concurrency', $client->accessTokenAbilities())->plainTextToken,
                'budget' => SettingKey::ClientPhoneOtpMaxAttempts, 'accepted' => fn (): bool => $client->fresh()->phone_verified_at !== null];
        })(),
        'client email code' => (function () use ($cached): array {
            $client = ClientModel::factory()->unverified()->create();
            app(ClientEmailVerificationCodes::class)->issue((string) $client->id, '123456');

            return [...$cached("email_verify_{$client->id}"), 'uri' => '/api/v1/client/email/verify',
                'token' => $client->createToken('concurrency', $client->accessTokenAbilities())->plainTextToken,
                'budget' => SettingKey::ClientEmailVerificationMaxAttempts, 'accepted' => fn (): bool => $client->fresh()->email_verified_at !== null];
        })(),
        'barber email code' => (function () use ($cached): array {
            $barber = BarberModel::factory()->create(['email_verified_at' => null, 'has_login' => true, 'status' => BarberStatusEnum::Pending]);
            app(OneTimeCodes::class)->issue("barber_email_verify_{$barber->id}", '123456', now()->addMinutes(10));

            return [...$cached("barber_email_verify_{$barber->id}"), 'uri' => '/api/v1/barber/email/verify',
                'token' => $barber->createToken('concurrency', TokenAbility::forBarberApp())->plainTextToken,
                'budget' => SettingKey::BarberEmailVerificationMaxAttempts, 'accepted' => fn (): bool => $barber->fresh()->email_verified_at !== null];
        })(),
        'client password reset' => (function () use ($cached, $passwordBody, $passwordChanged): array {
            $client = ClientModel::factory()->create();
            app(PasswordResetCodeVerifier::class)->issue((string) $client->id, '123456');

            return [...$cached("password_reset_{$client->id}"), 'uri' => '/api/v1/client/reset-password', 'body' => $passwordBody($client->email),
                'budget' => SettingKey::ClientPasswordResetMaxAttempts, 'accepted' => $passwordChanged($client)];
        })(),
        'barber password reset', 'branch password reset' => (function () use ($name, $cached, $passwordBody, $passwordChanged): array {
            $scope = explode(' ', $name)[0];
            $account = $scope === 'barber'
                ? BarberModel::factory()->create(['has_login' => true, 'status' => BarberStatusEnum::Enabled])
                : BranchModel::factory()->create();
            app(StaffPasswordResetCodes::class)->issue($scope, (string) $account->getKey(), '123456');

            return [...$cached("staff_password_reset_{$scope}_{$account->getKey()}"), 'uri' => "/api/v1/{$scope}/reset-password", 'body' => $passwordBody((string) $account->getAttribute('email')),
                'budget' => SettingKey::ClientPasswordResetMaxAttempts, 'accepted' => $passwordChanged($account)];
        })(),
        'dashboard email change' => (function (): array {
            config(['dashboard.dashboard.session_secret' => CONCURRENCY_CODE_SESSION_SECRET]);
            $branch = BranchModel::factory()->create();
            $actor = new DashboardActor((string) $branch->id, DashboardActorTypeEnum::Branch, 'branch_manager', (string) $branch->id, (string) $branch->brand_id);
            $change = app(DashboardEmailChangeEloquentResolver::class)->upsert($actor, 'moved@example.test', Hash::make('123456'));
            $access = $branch->createToken('dashboard-session', ['dashboard']);

            return ['table' => 'dashboard_email_changes', 'column' => 'id', 'value' => (string) $change->getKey(),
                'uri' => '/api/v1/dashboard/profile/email/verify', 'token' => $access->plainTextToken, 'body' => [],
                'headers' => ['X-Dashboard-Session' => app(DashboardSessionClaim::class)->issue($actor, $access->accessToken->getKey())],
                'env' => [...CONCURRENCY_CACHE, 'DASHBOARD_SESSION_SECRET' => CONCURRENCY_CODE_SESSION_SECRET],
                'budget' => SettingKey::DashboardEmailChangeMaxAttempts, 'accepted' => fn (): bool => $branch->fresh()->email === 'moved@example.test'];
        })(),
    };
}

dataset('one-time code flows', ['phone code', 'client email code', 'barber email code', 'client password reset', 'barber password reset', 'branch password reset', 'dashboard email change']);

describe('One-time codes under parallel requests (BG-28)', function (): void {
    it('accepts one code once', function (string $name): void {
        $flow = concurrencyCodeFlow($name);
        concurrencyCommitFixtures();

        $results = concurrencyAgainstHeldCode($flow, ['123456', '123456', '123456']);

        expect(concurrencyStatuses($results))->toBe([200, 422, 422], implode("\n", array_column($results, 'stderr')))
            ->and($flow['accepted']())->toBeTrue();
    })->with('one-time code flows');

    it('refuses the right code once a parallel wrong guess used up the budget', function (string $name): void {
        $flow = concurrencyCodeFlow($name);
        app(SettingsService::class)->update([$flow['budget']->value => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MIN]);
        concurrencyCommitFixtures();

        $results = concurrencyAgainstHeldCode($flow, ['000000', '123456']);

        expect(array_column($results, 'status'))->toBe([422, 422], implode("\n", array_column($results, 'stderr')))
            ->and($flow['accepted']())->toBeFalse();
    })->with('one-time code flows');
});
