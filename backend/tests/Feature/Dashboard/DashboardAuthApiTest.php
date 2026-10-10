<?php

declare(strict_types=1);

use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Models\DashboardRefreshTokenModel;

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

        $claim = decodeDashboardClaim((string) $response->json('data.claim'));
        expect($claim)
            ->toMatchArray([
                'actor_type' => 'barber',
                'iss' => 'dorak-backend',
                'role' => 'barber',
                'sub' => $barber->id,
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
        ])->assertOk();

        expect($rotated->json('data.refresh_token'))->toBeString()->not->toBe($originalRefresh);

        $this->withHeader('Authorization', 'Bearer '.$rotated->json('data.token'))
            ->getJson('/api/v1/dashboard/me')
            ->assertOk();

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
        $refreshToken = (string) $login->json('data.refresh_token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/dashboard/logout')
            ->assertOk()
            ->assertJsonPath('data.logged_out', true);

        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$token)
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
