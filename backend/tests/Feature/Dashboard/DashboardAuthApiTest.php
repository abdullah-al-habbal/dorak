<?php

declare(strict_types=1);

use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Constants\DashboardActorConstants;
use Modules\Dashboard\Models\DashboardRefreshTokenModel;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardSessionClaim;

describe('Dashboard auth API', function (): void {
    beforeEach(function (): void {
        $this->withoutMiddleware(ThrottleRequests::class);

        config([
            'dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters',
        ]);
    });

    it('issues a barber Sanctum token and claim without branch scope', function (): void {
        $barber = BarberModel::factory()->create([
            'email' => 'barber@example.test',
            'password' => Hash::make('password'),
            'has_login' => true,
            'status' => BarberStatusEnum::Enabled,
        ]);

        $response = $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'barber',
            'email' => $barber->email,
            'password' => 'password',
        ])->assertOk();

        $claimToken = (string) $response->json('data.claim');
        $claim = decodeDashboardClaim($claimToken);
        $header = decodeDashboardClaimHeader($claimToken);
        expect($header)->toMatchArray(['alg' => 'HS256', 'kid' => 'default']);
        expect($claim)
            ->toMatchArray([
                'actor_type' => 'barber',
                'iss' => 'dorak-backend',
                'role' => 'barber',
                'sub' => $barber->id,
                'jti' => $claim['jti'],
            ])
            ->not->toHaveKey('branch_id');
        expect($response->json('data.refresh_token'))->toBeString()->not->toBeEmpty();

        $this->withHeader('Authorization', 'Bearer '.$response->json('data.token'))
            ->getJson('/api/v1/dashboard/me')
            ->assertOk()
            ->assertJsonPath('data.actor_type', 'barber')
            ->assertJsonPath('data.role', 'barber');
    });

    it('rejects a disabled barber', function (): void {
        $barber = BarberModel::factory()->create([
            'email' => 'disabled-barber@example.test',
            'password' => Hash::make('password'),
            'has_login' => true,
            'status' => BarberStatusEnum::Disabled,
        ]);

        $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'barber',
            'email' => $barber->email,
            'password' => 'password',
        ])->assertUnauthorized();
    });

    it('signs with the active key and accepts retained keys until removal', function (): void {
        $oldSecret = 'dashboard-key-k1-secret-at-least-thirty-two-characters';
        $newSecret = 'dashboard-key-k2-secret-at-least-thirty-two-characters';
        config([
            'dashboard.dashboard.session_secrets' => json_encode(['k1' => $oldSecret, 'k2' => $newSecret]),
            'dashboard.dashboard.active_kid' => 'k1',
        ]);
        $claimService = app(DashboardSessionClaim::class);
        $admin = AdminModel::factory()->create();
        $actor = new DashboardActor((string) $admin->id, DashboardActorConstants::DASHBOARD_ACTOR_ADMIN, 'platform_admin', null);
        $oldClaim = $claimService->issue($actor);
        $token = $admin->createToken('dashboard-session', ['dashboard'])->plainTextToken;

        config(['dashboard.dashboard.active_kid' => 'k2']);
        expect(decodeDashboardClaimHeader($claimService->issue($actor))['kid'])->toBe('k2');
        expect($claimService->isValid($oldClaim))->toBeTrue();
        $this->withHeader('X-Dashboard-Session', $oldClaim)
            ->withToken($token)
            ->getJson('/api/v1/dashboard/me')
            ->assertOk();

        config(['dashboard.dashboard.session_secrets' => json_encode(['k2' => $newSecret])]);
        expect($claimService->isValid($oldClaim))->toBeFalse();
        $this->withHeader('X-Dashboard-Session', $oldClaim)
            ->withToken($token)
            ->getJson('/api/v1/dashboard/me')
            ->assertUnauthorized();
    });

    it('returns the admin identity and token abilities from me', function (): void {
        $admin = AdminModel::factory()->create([
            'email' => 'admin@example.test',
            'password' => Hash::make('password'),
        ]);

        $token = (string) $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'admin',
            'email' => $admin->email,
            'password' => 'password',
        ])->assertOk()->json('data.token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/dashboard/me')
            ->assertOk()
            ->assertJsonPath('data.actor_type', 'admin')
            ->assertJsonPath('data.role', 'platform_admin')
            ->assertJsonPath('data.branch_id', null)
            ->assertJsonPath('data.email', $admin->email)
            ->assertJsonPath('data.permissions', ['dashboard']);
    });

    it('returns the branch_manager identity scoped to its branch', function (): void {
        $branch = BranchModel::factory()->create([
            'email' => 'manager@example.test',
            'password' => Hash::make('password'),
        ]);

        $token = (string) $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'branch',
            'email' => $branch->email,
            'password' => 'password',
        ])->assertOk()->json('data.token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/dashboard/me')
            ->assertOk()
            ->assertJsonPath('data.actor_type', 'branch')
            ->assertJsonPath('data.role', 'branch_manager')
            ->assertJsonPath('data.branch_id', $branch->id);
    });

    it('rejects a token that does not carry the dashboard ability', function (): void {
        $admin = AdminModel::factory()->create();

        $token = $admin->createToken('other', ['other'])->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/dashboard/me')
            ->assertUnauthorized();
    });

    it('prevents a barber dashboard session from reaching management endpoints', function (): void {
        $barber = BarberModel::factory()->create([
            'password' => Hash::make('password'),
            'has_login' => true,
            'status' => BarberStatusEnum::Enabled,
        ]);
        $token = (string) $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'barber',
            'email' => $barber->email,
            'password' => 'password',
        ])->assertOk()->json('data.token');

        $this->withToken($token)->getJson('/api/v1/dashboard/chairs')->assertForbidden();
    });

    it('rotates the refresh token and rejects replay of the used token', function (): void {
        $admin = AdminModel::factory()->create([
            'email' => 'admin@example.test',
            'password' => Hash::make('password'),
        ]);

        $login = $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'admin',
            'email' => $admin->email,
            'password' => 'password',
        ])->assertOk();

        $originalRefresh = (string) $login->json('data.refresh_token');

        $rotated = $this->postJson('/api/v1/dashboard/refresh', [
            'refresh_token' => $originalRefresh,
            'claim' => $login->json('data.claim'),
        ])->assertOk();

        expect($rotated->json('data.refresh_token'))->toBeString()->not->toBe($originalRefresh);

        $this->withHeader('Authorization', 'Bearer '.$rotated->json('data.token'))
            ->getJson('/api/v1/dashboard/me')
            ->assertOk();

        $this->withHeader('X-Dashboard-Session', (string) $login->json('data.claim'))
            ->getJson('/api/v1/dashboard/me')
            ->assertUnauthorized();

        $this->postJson('/api/v1/dashboard/refresh', [
            'refresh_token' => $originalRefresh,
        ])->assertUnauthorized();
    });

    it('rejects an expired refresh token', function (): void {
        $admin = AdminModel::factory()->create([
            'email' => 'admin@example.test',
            'password' => Hash::make('password'),
        ]);

        $refreshToken = (string) $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'admin',
            'email' => $admin->email,
            'password' => 'password',
        ])->assertOk()->json('data.refresh_token');

        DashboardRefreshTokenModel::query()->update(['expires_at' => now()->subMinute()]);

        $this->postJson('/api/v1/dashboard/refresh', [
            'refresh_token' => $refreshToken,
        ])->assertUnauthorized();
    });

    it('revokes the access and refresh tokens on logout', function (): void {
        $admin = AdminModel::factory()->create([
            'email' => 'admin@example.test',
            'password' => Hash::make('password'),
        ]);

        $login = $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'admin',
            'email' => $admin->email,
            'password' => 'password',
        ])->assertOk();

        $token = (string) $login->json('data.token');
        $claim = (string) $login->json('data.claim');
        $refreshToken = (string) $login->json('data.refresh_token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/dashboard/logout', ['claim' => $claim])
            ->assertOk()
            ->assertJsonPath('data.logged_out', true);

        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/dashboard/me')
            ->assertUnauthorized();

        $this->withHeader('X-Dashboard-Session', $claim)
            ->getJson('/api/v1/dashboard/me')
            ->assertUnauthorized();

        $this->postJson('/api/v1/dashboard/refresh', [
            'refresh_token' => $refreshToken,
        ])->assertUnauthorized();
    });
});

/** @return array<string, mixed> */
function decodeDashboardClaim(string $claim): array
{
    [, $encodedPayload] = explode('.', $claim);
    $payload = json_decode(base64_decode(strtr($encodedPayload, '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);

    return $payload;
}

/** @return array<string, mixed> */
function decodeDashboardClaimHeader(string $claim): array
{
    [$encodedHeader] = explode('.', $claim);

    return json_decode(base64_decode(strtr($encodedHeader, '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);
}
