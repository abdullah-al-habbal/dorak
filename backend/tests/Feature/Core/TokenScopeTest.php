<?php

declare(strict_types=1);

use Laravel\Sanctum\Sanctum;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

describe('token scope enforcement', function (): void {
    it('rejects a dashboard-scoped token on mobile branch routes with 403', function (): void {
        $branch = BranchModel::factory()->create();
        $token = $branch->createToken('dashboard-session', TokenAbility::forDashboard())->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/branch/profile')
            ->assertForbidden()
            ->assertJsonPath('code', 'TOKEN_ABILITY_MISSING');
    });

    it('rejects a dashboard-scoped token on mobile barber routes with 403', function (): void {
        $barber = BarberModel::factory()->create();
        $token = $barber->createToken('dashboard-session', TokenAbility::forDashboard())->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/barber/profile')
            ->assertForbidden()
            ->assertJsonPath('code', 'TOKEN_ABILITY_MISSING');
    });

    it('accepts explicitly scoped mobile-app tokens on their own routes', function (): void {
        $branch = BranchModel::factory()->create();
        $token = $branch->createToken('branch-app', TokenAbility::forBranchApp())->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/branch/profile')->assertOk();
    });

    it('keeps legacy wildcard tokens working on mobile routes', function (): void {
        $branch = BranchModel::factory()->create();
        $token = $branch->createToken('branch-app')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/branch/profile')->assertOk();
    });

    it('rejects a token carrying only an unrelated ability on mobile routes', function (): void {
        $branch = BranchModel::factory()->create();
        $token = $branch->createToken('other', ['something-else'])->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/branch/profile')->assertForbidden();
    });

    it('rejects a mobile-app scoped token on dashboard routes', function (): void {
        $branch = BranchModel::factory()->create();
        $token = $branch->createToken('branch-app', TokenAbility::forBranchApp())->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/dashboard/me')->assertUnauthorized();
    });

    it('lets a dashboard-scoped token reach the shared notification inbox', function (): void {
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->getJson('/api/v1/notifications')->assertOk();
    });

    it('issues mobile tokens with explicit abilities at login and refresh', function (): void {
        $branch = BranchModel::factory()->create(['password' => 'secret-pass-123']);

        $login = $this->postJson('/api/v1/branch/login', ['email' => $branch->email, 'password' => 'secret-pass-123'])
            ->assertOk();
        $plain = $login->json('data.token') ?? $login->json('token');
        expect($plain)->toBeString();

        $stored = $branch->tokens()->latest('id')->first();
        expect($stored->abilities)->toBe(TokenAbility::forBranchApp());
    });

    it('stamps client tokens with the active or verification ability', function (): void {
        $client = ClientModel::factory()->create();

        expect($client->accessTokenAbilities())->toBe([TokenAbility::ClientActive->value]);
    });
});

describe('chair update guard', function (): void {
    it('rejects anonymous and client callers with 401', function (): void {
        $chair = ChairModel::factory()->create();

        $this->patchJson("/api/v1/chairs/{$chair->id}", ['status' => 'occupied'])->assertUnauthorized();

        Sanctum::actingAs(ClientModel::factory()->create(), [TokenAbility::ClientActive->value], 'client');
        $this->patchJson("/api/v1/chairs/{$chair->id}", ['status' => 'occupied'])->assertUnauthorized();
    });

    it('still forbids a branch from updating another branch chair', function (): void {
        $chair = ChairModel::factory()->create();

        $this->actingAs(BranchModel::factory()->create(), 'branch_api');
        $this->patchJson("/api/v1/chairs/{$chair->id}", ['status' => 'maintenance'])->assertForbidden();
    });

    it('allows an admin to update any chair', function (): void {
        $chair = ChairModel::factory()->create();

        $this->actingAs(AdminModel::factory()->create(), 'admin_api');
        $this->patchJson("/api/v1/chairs/{$chair->id}", ['status' => 'maintenance'])->assertSuccessful();
    });
});

describe('superseded duplicate routes', function (): void {
    it('no longer exposes catalog writes outside the dashboard', function (): void {
        $item = ServiceCatalogItemModel::factory()->create();
        Sanctum::actingAs(AdminModel::factory()->create(), ['*'], 'admin_api');

        $this->postJson('/api/v1/service-catalog/items', [])->assertStatus(405);
        $this->putJson("/api/v1/service-catalog/items/{$item->id}", ['slug' => 'x'])->assertStatus(405);
        $this->deleteJson("/api/v1/service-catalog/items/{$item->id}")->assertStatus(405);
        $this->assertDatabaseHas('service_catalog_items', ['id' => $item->id, 'deleted_at' => null]);
    });

    it('keeps the public catalog and exchange-rate reads for mobile', function (): void {
        $this->getJson('/api/v1/service-catalog/items')->assertOk();
        $this->getJson('/api/v1/service-catalog/categories')->assertOk();
        $this->getJson('/api/v1/exchange-rates')->assertOk();
    });
});
