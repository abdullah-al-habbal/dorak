<?php

declare(strict_types=1);

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Client\Services\PasswordResetCodeVerifier;
use Modules\Core\Constants\StaffPasswordResetConstants;
use Modules\Core\Services\StaffPasswordResetCodes;
use Modules\Dashboard\Models\DashboardRefreshTokenModel;

const APP_RESET_NEW_PASSWORD = 'a-password-set-in-the-app-123';

/** A dashboard-eligible account with the password `password` and a pending app reset code `123456`. */
function appResetAccount(string $actorType): BranchModel|BarberModel|ClientModel
{
    $attributes = ['email' => "{$actorType}@example.test", 'password' => Hash::make('password')];
    $account = match ($actorType) {
        'branch' => BranchModel::factory()->create($attributes),
        'barber' => BarberModel::factory()->create([...$attributes, 'has_login' => true, 'status' => BarberStatusEnum::Enabled]),
        'owner' => tap(ClientModel::factory()->create($attributes), fn (ClientModel $client) => BrandModel::factory()->create(['owner_id' => $client->id])),
    };

    if ($actorType === 'owner') {
        app(PasswordResetCodeVerifier::class)->issue((string) $account->getKey(), '123456');
    } else {
        $scope = $actorType === 'barber' ? StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BARBER : StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH;
        app(StaffPasswordResetCodes::class)->issue($scope, (string) $account->getKey(), '123456');
    }

    return $account;
}

function appResetDashboardSignIn(mixed $test, string $actorType): string
{
    return (string) $test->postJson('/api/v1/dashboard/login', ['actor_type' => $actorType, 'email' => "{$actorType}@example.test", 'password' => 'password'])
        ->assertOk()->json('data.refresh_token');
}

/** Makes revocation fail midway: the password is saved and the API tokens are deleted by the time this throws. */
function appResetBreakRevocation(): void
{
    DB::listen(function (QueryExecuted $query): void {
        if (str_starts_with($query->sql, 'update `dashboard_refresh_tokens`')) {
            throw new RuntimeException('revocation failed');
        }
    });
}

/** BG-60: a password set in an app ends the account's dashboard sessions too. */
describe('App password reset and dashboard sessions', function (): void {
    beforeEach(function (): void {
        $this->withoutMiddleware(ThrottleRequests::class);
        config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
    });

    it('stops a dashboard session from renewing itself after a password reset in the app', function (string $actorType): void {
        $account = appResetAccount($actorType);
        $refresh = appResetDashboardSignIn($this, $actorType);
        $guard = $actorType === 'owner' ? 'client' : $actorType;

        $this->postJson("/api/v1/{$guard}/reset-password", [
            'email' => $account->email,
            'code' => '123456',
            'password' => APP_RESET_NEW_PASSWORD,
            'password_confirmation' => APP_RESET_NEW_PASSWORD,
        ])->assertOk();

        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $refresh])->assertUnauthorized();
        expect(DashboardRefreshTokenModel::query()->where('actor_id', $account->getKey())->whereNull('revoked_at')->count())->toBe(0);
    })->with(['branch', 'barber', 'owner']);

    it('keeps dashboard sessions when the reset code is wrong', function (string $actorType): void {
        $account = appResetAccount($actorType);
        $refresh = appResetDashboardSignIn($this, $actorType);
        $guard = $actorType === 'owner' ? 'client' : $actorType;

        $this->postJson("/api/v1/{$guard}/reset-password", [
            'email' => $account->email,
            'code' => '000000',
            'password' => APP_RESET_NEW_PASSWORD,
            'password_confirmation' => APP_RESET_NEW_PASSWORD,
        ])->assertClientError();

        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $refresh])->assertOk();
    })->with(['branch', 'barber', 'owner']);

    it('stops a dashboard session from renewing itself after a client changes the password while signed in', function (): void {
        $owner = appResetAccount('owner');
        $refresh = appResetDashboardSignIn($this, 'owner');
        $appToken = $owner->createToken('client-app', $owner->accessTokenAbilities())->plainTextToken;

        $this->withToken($appToken)->patchJson('/api/v1/client/password', [
            'current_password' => 'password',
            'password' => APP_RESET_NEW_PASSWORD,
            'password_confirmation' => APP_RESET_NEW_PASSWORD,
        ])->assertOk();

        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $refresh])->assertUnauthorized();
    });

    it('keeps the old password and every session when revocation fails during a reset', function (string $actorType): void {
        $account = appResetAccount($actorType);
        $refresh = appResetDashboardSignIn($this, $actorType);
        $guard = $actorType === 'owner' ? 'client' : $actorType;
        $account->createToken('app');
        $tokens = $account->tokens()->count();
        $link = Password::broker($actorType === 'owner' ? 'clients' : ($actorType === 'branch' ? 'branches' : 'barbers'))->createToken($account);
        appResetBreakRevocation();

        $this->postJson("/api/v1/{$guard}/reset-password", [
            'email' => $account->email,
            'code' => '123456',
            'password' => APP_RESET_NEW_PASSWORD,
            'password_confirmation' => APP_RESET_NEW_PASSWORD,
        ])->assertServerError();

        expect(Hash::check('password', $account->fresh()->password))->toBeTrue()
            ->and($account->tokens()->count())->toBe($tokens)
            ->and(DashboardRefreshTokenModel::query()->where('actor_id', $account->getKey())->whereNull('revoked_at')->count())->toBe(1)
            ->and(Password::broker($actorType === 'owner' ? 'clients' : ($actorType === 'branch' ? 'branches' : 'barbers'))->tokenExists($account, $link))->toBeTrue();
    })->with(['branch', 'barber', 'owner']);

    it('keeps the old password and every session when revocation fails during a signed-in change', function (): void {
        $owner = appResetAccount('owner');
        appResetDashboardSignIn($this, 'owner');
        $appToken = $owner->createToken('client-app', $owner->accessTokenAbilities())->plainTextToken;
        $tokens = $owner->tokens()->count();
        appResetBreakRevocation();

        $this->app['auth']->forgetGuards();
        $this->withToken($appToken)->patchJson('/api/v1/client/password', [
            'current_password' => 'password',
            'password' => APP_RESET_NEW_PASSWORD,
            'password_confirmation' => APP_RESET_NEW_PASSWORD,
        ])->assertServerError();

        expect(Hash::check('password', $owner->fresh()->password))->toBeTrue()
            ->and($owner->tokens()->count())->toBe($tokens)
            ->and(DashboardRefreshTokenModel::query()->where('actor_id', $owner->getKey())->whereNull('revoked_at')->count())->toBe(1);
    });

    it('leaves another account\'s dashboard session alone', function (): void {
        $account = appResetAccount('branch');
        appResetAccount('barber');
        $other = appResetDashboardSignIn($this, 'barber');

        $this->postJson('/api/v1/branch/reset-password', [
            'email' => $account->email,
            'code' => '123456',
            'password' => APP_RESET_NEW_PASSWORD,
            'password_confirmation' => APP_RESET_NEW_PASSWORD,
        ])->assertOk();

        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $other])->assertOk();
    });
});
