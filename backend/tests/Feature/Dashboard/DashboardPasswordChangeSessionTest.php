<?php

declare(strict_types=1);

use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Constants\StaffPasswordResetConstants;
use Modules\Core\Services\StaffPasswordResetCodes;
use Modules\Dashboard\Mail\SendDashboardEmailChangeCode;
use Modules\Dashboard\Models\DashboardRefreshTokenModel;
use Modules\Dashboard\Repositories\DashboardRefreshTokenResolver;

const CHANGE_NEW_PASSWORD = 'a-changed-password-456';

/** Signs in through the dashboard API and returns the session's tokens. */
function changeSessionSignIn(mixed $test, string $actorType, string $email): array
{
    $data = $test->postJson('/api/v1/dashboard/login', ['actor_type' => $actorType, 'email' => $email, 'password' => 'password'])->assertOk()->json('data');

    return ['token' => (string) $data['token'], 'claim' => (string) $data['claim'], 'refresh' => (string) $data['refresh_token']];
}

describe('Dashboard password change sessions', function (): void {
    beforeEach(function (): void {
        $this->withoutMiddleware(ThrottleRequests::class);
        config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
    });

    it('keeps the session that changed the password and ends every other one', function (): void {
        $branch = BranchModel::factory()->create(['email' => 'manager@example.test', 'password' => Hash::make('password')]);
        $current = changeSessionSignIn($this, 'branch', 'manager@example.test');
        $other = changeSessionSignIn($this, 'branch', 'manager@example.test');
        $branch->createToken('mobile-session');
        $link = Password::broker('branches')->createToken($branch);
        app(StaffPasswordResetCodes::class)->issue(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, (string) $branch->id, '123456');

        $this->withToken($current['token'])->withHeader('X-Dashboard-Session', $current['claim'])
            ->putJson('/api/v1/dashboard/profile/password', [
                'current_password' => 'password',
                'password' => CHANGE_NEW_PASSWORD,
                'password_confirmation' => CHANGE_NEW_PASSWORD,
                'refresh_token' => $current['refresh'],
            ])
            ->assertOk();

        $resolver = app(DashboardRefreshTokenResolver::class);
        expect($branch->tokens()->pluck('id')->all())->toHaveCount(1)
            ->and($resolver->rotate($other['refresh']))->toBeNull()
            ->and($resolver->rotate($current['refresh']))->not->toBeNull()
            ->and(Password::broker('branches')->tokenExists($branch, $link))->toBeFalse()
            ->and(app(StaffPasswordResetCodes::class)->verify(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, (string) $branch->id, '123456'))->toBeFalse();
        $this->app['auth']->forgetGuards();
        $this->withToken($current['token'])->withHeader('X-Dashboard-Session', $current['claim'])
            ->getJson('/api/v1/dashboard/profile')->assertOk();
        $this->app['auth']->forgetGuards();
        $this->withToken($other['token'])->withHeader('X-Dashboard-Session', $other['claim'])
            ->getJson('/api/v1/dashboard/profile')->assertUnauthorized();
    });

    it('ends every refresh token when the caller sends none', function (): void {
        BranchModel::factory()->create(['email' => 'legacy@example.test', 'password' => Hash::make('password')]);
        $session = changeSessionSignIn($this, 'branch', 'legacy@example.test');

        $this->withToken($session['token'])->withHeader('X-Dashboard-Session', $session['claim'])
            ->putJson('/api/v1/dashboard/profile/password', ['current_password' => 'password', 'password' => CHANGE_NEW_PASSWORD, 'password_confirmation' => CHANGE_NEW_PASSWORD])
            ->assertOk();

        expect(DashboardRefreshTokenModel::query()->whereNull('revoked_at')->count())->toBe(0);
    });

    it('moves an owner to the new email in the client app too', function (): void {
        Mail::fake();
        $owner = ClientModel::factory()->create(['email' => 'old-owner@example.test', 'password' => Hash::make('password')]);
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        $this->authenticateDashboardActor($owner);

        $this->postJson('/api/v1/dashboard/profile/email/change', ['email' => 'new-owner@example.test', 'current_password' => 'password'])->assertOk();
        $code = '';
        Mail::assertSent(SendDashboardEmailChangeCode::class, function (SendDashboardEmailChangeCode $mail) use (&$code): bool {
            $code = $mail->code;

            return true;
        });
        $this->postJson('/api/v1/dashboard/profile/email/verify', ['code' => $code])->assertOk();
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        $login = $this->postJson('/api/v1/client/login', ['email' => 'new-owner@example.test', 'password' => 'password']);
        expect($login->status())->toBe(200, (string) $login->getContent());
        $this->postJson('/api/v1/client/login', ['email' => 'old-owner@example.test', 'password' => 'password'])->assertUnauthorized();
    });
});
