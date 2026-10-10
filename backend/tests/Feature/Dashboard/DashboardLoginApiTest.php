<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;

describe('Dashboard login API', function (): void {
    beforeEach(function (): void {
        config([
            'dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters',
        ]);
    });

    it('issues an admin Sanctum token and dashboard claim', function (): void {
        $admin = AdminModel::factory()->create([
            'email' => 'admin@example.test',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'admin',
            'email' => $admin->email,
            'password' => 'password',
        ])->assertOk();

        $response->assertJsonPath('data.token', fn (mixed $value): bool => is_string($value) && $value !== '');
        $token = (string) $response->json('data.token');
        $claim = dashboardClaimPayload((string) $response->json('data.claim'));
        expect($claim)
            ->toMatchArray([
                'actor_type' => 'admin',
                'iss' => 'dorak-backend',
                'role' => 'platform_admin',
                'sub' => $admin->id,
            ])
            ->not->toHaveKey('branch_id');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/dashboard/overview')
            ->assertOk();
    });

    it('issues a branch-scoped Sanctum token and dashboard claim', function (): void {
        $branch = BranchModel::factory()->create([
            'email' => 'manager@example.test',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'branch',
            'email' => $branch->email,
            'password' => 'password',
        ])->assertOk();

        $claim = dashboardClaimPayload((string) $response->json('data.claim'));
        expect($claim)->toMatchArray([
            'actor_type' => 'branch',
            'branch_id' => $branch->id,
            'iss' => 'dorak-backend',
            'role' => 'branch_manager',
            'sub' => $branch->id,
        ]);
    });

    it('rejects credentials for the wrong dashboard actor type', function (): void {
        $branch = BranchModel::factory()->create([
            'email' => 'manager@example.test',
            'password' => Hash::make('password'),
        ]);

        $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'admin',
            'email' => $branch->email,
            'password' => 'password',
        ])->assertUnauthorized();
    });
});

/** @return array<string, mixed> */
function dashboardClaimPayload(string $claim): array
{
    [, $encodedPayload] = explode('.', $claim);
    $payload = json_decode(base64_decode(strtr($encodedPayload, '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);

    return $payload;
}
