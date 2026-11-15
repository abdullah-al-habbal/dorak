<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Hash;
use Illuminate\Testing\TestResponse;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Models\DashboardRefreshTokenModel;

beforeEach(function (): void {
    config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
});

/** S6 (F-01b, F-01c): one liveness answer for login, refresh and every request. */
function livenessLogin(string $type, string $email): array
{
    $response = test()->postJson('/api/v1/dashboard/login', ['actor_type' => $type, 'email' => $email, 'password' => 'password']);

    return [$response, (string) $response->json('data.refresh_token')];
}

function livenessRefresh(string $refreshToken): TestResponse
{
    return test()->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $refreshToken]);
}

describe('Refresh re-validates the account (F-01c)', function (): void {
    it('refuses to renew the session of a banned or Disabled barber and revokes the token', function (string $case): void {
        $barber = BarberModel::factory()->create(['email' => 'b@example.test', 'password' => Hash::make('password'), 'has_login' => true, 'status' => BarberStatusEnum::Enabled]);
        [, $refresh] = livenessLogin('barber', $barber->email);
        $case === 'banned'
            ? $barber->bans()->create(['reason' => 'Abuse.', 'banned_at' => now()->subMinute()])
            : $barber->update(['status' => BarberStatusEnum::Disabled]);

        livenessRefresh($refresh)->assertUnauthorized();
        expect(DashboardRefreshTokenModel::query()->where('actor_id', $barber->id)->whereNull('revoked_at')->count())->toBe(0);
    })->with(['banned', 'disabled']);

    it('refuses to renew the session of a banned owner', function (): void {
        $owner = ClientModel::factory()->create(['email' => 'o@example.test', 'password' => Hash::make('password')]);
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        [$login, $refresh] = livenessLogin('owner', $owner->email);
        $login->assertOk();
        $owner->bans()->create(['reason' => 'Fraud.', 'banned_at' => now()->subMinute()]);

        livenessRefresh($refresh)->assertUnauthorized();
    });

    it('refuses to renew the session of a banned or deleted branch manager', function (string $case): void {
        $branch = BranchModel::factory()->create(['email' => 'm@example.test', 'password' => Hash::make('password')]);
        [$login, $refresh] = livenessLogin('branch', $branch->email);
        $login->assertOk();
        $case === 'banned'
            ? $branch->bans()->create(['reason' => 'Abuse.', 'banned_at' => now()->subMinute()])
            : $branch->delete();

        livenessRefresh($refresh)->assertUnauthorized();
    })->with(['banned', 'deleted']);

    it('still renews the session of a live manager whose branch is Suspended (reads stay open, writes are guarded)', function (): void {
        $branch = BranchModel::factory()->create(['email' => 'm@example.test', 'password' => Hash::make('password'), 'status' => BranchStatusEnum::Suspended]);
        [, $refresh] = livenessLogin('branch', $branch->email);

        livenessRefresh($refresh)->assertOk();
    });

    it('still renews the session of a live Enabled barber', function (): void {
        $barber = BarberModel::factory()->create(['email' => 'b@example.test', 'password' => Hash::make('password'), 'has_login' => true, 'status' => BarberStatusEnum::Enabled]);
        [, $refresh] = livenessLogin('barber', $barber->email);

        livenessRefresh($refresh)->assertOk();
    });
});

describe('Manager accounts are ban-checked (F-01b)', function (): void {
    it('refuses a banned manager at login with the account-banned answer', function (): void {
        $branch = BranchModel::factory()->create(['email' => 'm@example.test', 'password' => Hash::make('password')]);
        $branch->bans()->create(['reason' => 'Abuse.', 'banned_at' => now()->subMinute()]);

        [$response] = livenessLogin('branch', $branch->email);

        $response->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');
    });

    it('revokes the access tokens of a manager when a ban starts', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);
        $this->getJson('/api/v1/dashboard/me')->assertOk();

        $branch->bans()->create(['reason' => 'Abuse.', 'banned_at' => now()->subMinute()]);

        expect($branch->tokens()->count())->toBe(0);
    });

    it('lets a manager through once the ban has expired', function (): void {
        $branch = BranchModel::factory()->create();
        $branch->bans()->create(['reason' => 'Old.', 'banned_at' => now()->subDays(2), 'expires_at' => now()->subDay()]);
        $this->authenticateDashboardActor($branch);

        $this->getJson('/api/v1/dashboard/me')->assertOk();
    });

    it('answers 403 ACCOUNT_BANNED for a banned manager holding a token the ban did not revoke', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);
        $branch->bans()->create(['reason' => 'Abuse.', 'banned_at' => now()->subMinute()]);
        // The observer deletes tokens; a token issued after the ban started (or a race) must still be refused.
        $this->authenticateDashboardActor($branch);

        $this->getJson('/api/v1/dashboard/me')->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');
    });
});

describe('A barber that is no longer Enabled loses the session (F-01c)', function (): void {
    it('answers 401 on every request', function (): void {
        $barber = BarberModel::factory()->create(['status' => BarberStatusEnum::Disabled]);
        $this->authenticateDashboardActor($barber);

        $this->getJson('/api/v1/dashboard/me')->assertUnauthorized();
    });
});
