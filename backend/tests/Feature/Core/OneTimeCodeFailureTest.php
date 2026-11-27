<?php

declare(strict_types=1);

use Illuminate\Cache\Events\KeyForgotten;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Sleep;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Constants\OneTimeCodeConstants;
use Modules\Core\Constants\StaffPasswordResetConstants;
use Modules\Core\Contracts\SmsSender;
use Modules\Core\Exceptions\OneTimeCodeUnavailableException;
use Modules\Core\Services\OneTimeCodes;
use Modules\Core\Services\StaffPasswordResetCodes;

const CODE_FAILURE_NEW_PASSWORD = 'a-changed-password-456';

/** Another request holds the lock of this code for the rest of the test. */
function codeFailureHoldLock(string $key): void
{
    expect(Cache::lock($key.OneTimeCodeConstants::LOCK_SUFFIX, OneTimeCodeConstants::LOCK_TTL_SECONDS)->get())->toBeTrue();
    // The wait for the lock is timed with the framework clock, so each retry moves it on.
    Sleep::fake(syncWithCarbon: true);
}

/** @return array{branch: BranchModel, token: string, claim: string, refresh: string} */
function codeFailureSignedInBranch(mixed $test): array
{
    $branch = BranchModel::factory()->create(['email' => 'manager@example.test', 'password' => Hash::make('password')]);
    $data = $test->postJson('/api/v1/dashboard/login', ['actor_type' => 'branch', 'email' => 'manager@example.test', 'password' => 'password'])->assertOk()->json('data');
    app(StaffPasswordResetCodes::class)->issue(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, (string) $branch->id, '123456');

    return ['branch' => $branch, 'token' => (string) $data['token'], 'claim' => (string) $data['claim'], 'refresh' => (string) $data['refresh_token']];
}

function codeFailureChangePassword(mixed $test, array $session): mixed
{
    return $test->withToken($session['token'])->withHeader('X-Dashboard-Session', $session['claim'])
        ->putJson('/api/v1/dashboard/profile/password', [
            'current_password' => 'password',
            'password' => CODE_FAILURE_NEW_PASSWORD,
            'password_confirmation' => CODE_FAILURE_NEW_PASSWORD,
            'refresh_token' => $session['refresh'],
        ]);
}

function codeFailureResetPassword(mixed $test, BranchModel $branch, string $token): mixed
{
    return $test->postJson('/api/v1/dashboard/password/reset', [
        'actor_type' => 'branch',
        'email' => $branch->email,
        'token' => $token,
        'password' => CODE_FAILURE_NEW_PASSWORD,
        'password_confirmation' => CODE_FAILURE_NEW_PASSWORD,
    ]);
}

function codeFailureBranchKey(BranchModel $branch): string
{
    return "staff_password_reset_branch_{$branch->id}";
}

/** BG-28: a code that can't be stored or burned stops the work that depends on it. */
describe('One-time code write failures', function (): void {
    beforeEach(function (): void {
        Mail::fake();
        $this->withoutMiddleware(ThrottleRequests::class);
        config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
    });

    it('says so when a code cannot be stored because another request holds it', function (): void {
        codeFailureHoldLock('k');

        expect(fn () => app(OneTimeCodes::class)->issue('k', '123456', now()->addMinutes(5)))->toThrow(OneTimeCodeUnavailableException::class)
            ->and(Cache::get('k'))->toBeNull();
    });

    it('says so when a code cannot be burned because another request holds it', function (): void {
        app(OneTimeCodes::class)->issue('k', '123456', now()->addMinutes(5));
        codeFailureHoldLock('k');

        expect(fn () => app(OneTimeCodes::class)->forget('k'))->toThrow(OneTimeCodeUnavailableException::class)
            ->and(Cache::get('k'))->not->toBeNull();
    });

    it('says so when the store refuses the write', function (): void {
        Cache::swap(Mockery::mock(Cache::getFacadeRoot())->makePartial()->shouldReceive('put')->andReturnFalse()->getMock());

        expect(fn () => app(OneTimeCodes::class)->issue('k', '123456', now()->addMinutes(5)))->toThrow(OneTimeCodeUnavailableException::class);
    });

    it('says so when a burned code is still in the store', function (): void {
        app(OneTimeCodes::class)->issue('k', '123456', now()->addMinutes(5));
        Cache::swap(Mockery::mock(Cache::getFacadeRoot())->makePartial()->shouldReceive('forget')->andReturnFalse()->getMock());

        expect(fn () => app(OneTimeCodes::class)->forget('k'))->toThrow(OneTimeCodeUnavailableException::class)
            ->and(fn () => app(OneTimeCodes::class)->redeem('k', '123456', 3))->toThrow(OneTimeCodeUnavailableException::class);
    });

    it('answers 503 and changes nothing when a password change cannot burn the app reset code', function (): void {
        $session = codeFailureSignedInBranch($this);
        $session['branch']->createToken('mobile-session');
        $tokens = $session['branch']->tokens()->count();
        codeFailureHoldLock(codeFailureBranchKey($session['branch']));

        codeFailureChangePassword($this, $session)->assertStatus(503)->assertJsonPath('code', 'SERVICE_UNAVAILABLE');

        expect(Hash::check('password', $session['branch']->fresh()->password))->toBeTrue()
            ->and($session['branch']->tokens()->count())->toBe($tokens);
    });

    it('answers 503 and keeps the reset link when a password reset cannot burn the app reset code', function (): void {
        $branch = BranchModel::factory()->create(['password' => Hash::make('password')]);
        $link = Password::broker('branches')->createToken($branch);
        codeFailureHoldLock(codeFailureBranchKey($branch));

        codeFailureResetPassword($this, $branch, $link)->assertStatus(503);

        expect(Hash::check('password', $branch->fresh()->password))->toBeTrue()
            ->and(Password::broker('branches')->tokenExists($branch, $link))->toBeTrue();
    });

    it('keeps the app reset code when the reset link is wrong', function (): void {
        $branch = BranchModel::factory()->create();
        app(StaffPasswordResetCodes::class)->issue(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, (string) $branch->id, '123456');

        codeFailureResetPassword($this, $branch, 'not-the-token')->assertUnprocessable();

        expect(Cache::get(codeFailureBranchKey($branch)))->not->toBeNull();
    });

    it('burns the app reset code outside the password transaction', function (string $flow): void {
        if ($flow === 'change') {
            $session = codeFailureSignedInBranch($this);
            $branch = $session['branch'];
        } else {
            $branch = BranchModel::factory()->create();
            app(StaffPasswordResetCodes::class)->issue(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, (string) $branch->id, '123456');
            $link = Password::broker('branches')->createToken($branch);
        }
        $outside = DB::transactionLevel();
        $levels = [];
        $key = codeFailureBranchKey($branch);
        Event::listen(KeyForgotten::class, function (KeyForgotten $event) use ($key, &$levels): void {
            if ($event->key === $key) {
                $levels[] = DB::transactionLevel();
            }
        });

        ($flow === 'change' ? codeFailureChangePassword($this, $session) : codeFailureResetPassword($this, $branch, $link))->assertOk();

        expect($levels)->toBe([$outside])->and(Cache::get($key))->toBeNull();
    })->with(['change', 'reset']);

    it('answers a forgot-password request as usual, and mails nothing, when the code cannot be stored', function (string $guard): void {
        $account = match ($guard) {
            'client' => ClientModel::factory()->create(),
            'barber' => BarberModel::factory()->create(['has_login' => true, 'status' => BarberStatusEnum::Enabled]),
            'branch' => BranchModel::factory()->create(),
        };
        codeFailureHoldLock($guard === 'client' ? "password_reset_{$account->id}" : "staff_password_reset_{$guard}_{$account->id}");

        $this->postJson("/api/v1/{$guard}/forgot-password", ['email' => $account->email])->assertOk();

        Mail::assertNothingOutgoing();
    })->with(['client', 'barber', 'branch']);

    it('sends no sms when the phone code cannot be stored', function (): void {
        $this->mock(SmsSender::class)->shouldNotReceive('send');
        $client = ClientModel::factory()->create();
        codeFailureHoldLock("phone_otp_{$client->id}");

        $this->withToken($client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken)
            ->postJson('/api/v1/client/phone/otp', ['phone' => '+963911222333'])
            ->assertStatus(503);
    });

    it('mails no verification code when it cannot be stored', function (): void {
        $client = ClientModel::factory()->unverified()->create();
        codeFailureHoldLock("email_verify_{$client->id}");

        $this->withToken($client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken)
            ->postJson('/api/v1/client/email/verify/send')
            ->assertStatus(503);

        Mail::assertNothingOutgoing();
    });
});
