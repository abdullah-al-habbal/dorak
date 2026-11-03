<?php

declare(strict_types=1);

use Laravel\Sanctum\Sanctum;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;

it('creates a brand as pending approval', function (): void {
    $owner = ClientModel::factory()->create();
    $currency = CurrencyModel::factory()->create();
    $this->actingAs($owner, 'client');

    $response = $this->postJson('/api/v1/brands', [
        'name' => ['en' => 'Royal Cuts', 'ar' => 'رويال كتس'],
        'base_currency_code' => $currency->code,
    ])->assertCreated()->assertJsonPath('data.status', 'pending');

    expect(BrandModel::query()->findOrFail($response->json('data.id'))->status)->toBe(BrandStatusEnum::Pending);
});

it('hides a pending brand from the public list and detail', function (): void {
    $pending = BrandModel::factory()->pending()->create();
    $active = BrandModel::factory()->create();

    $ids = collect($this->getJson('/api/v1/brands')->assertOk()->json('data'))->pluck('id');

    expect($ids)->toContain($active->id)->not->toContain($pending->id);
    $this->getJson("/api/v1/brands/{$pending->id}")->assertNotFound();
    $this->getJson("/api/v1/brands/{$active->id}")->assertOk()->assertJsonPath('data.status', 'active');
});

it('blocks a branch of a pending brand from signing in and from the API', function (): void {
    $brand = BrandModel::factory()->pending()->create();
    $branch = BranchModel::factory()->create([
        'brand_id' => $brand->id,
        'status' => BranchStatusEnum::Enabled,
        'password' => bcrypt('branch-password-1'),
    ]);

    $this->postJson('/api/v1/branch/login', ['email' => $branch->email, 'password' => 'branch-password-1'])
        ->assertForbidden()
        ->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');

    Sanctum::actingAs($branch, ['*'], 'branch_api');
    $this->getJson('/api/v1/branch/dashboard')->assertForbidden();

    $brand->update(['status' => BrandStatusEnum::Active]);
    $this->postJson('/api/v1/branch/login', ['email' => $branch->email, 'password' => 'branch-password-1'])->assertOk();
});

it('keeps branches of pending brands out of discovery', function (): void {
    $pendingBranch = BranchModel::factory()->create(['brand_id' => BrandModel::factory()->pending()->create()->id]);
    $activeBranch = BranchModel::factory()->create();

    $ids = BranchModel::query()->discoverable()->pluck('id');

    expect($ids)->toContain($activeBranch->id)->not->toContain($pendingBranch->id);
});

it('lets an admin approve a pending brand', function (): void {
    $brand = BrandModel::factory()->pending()->create();
    Sanctum::actingAs(AdminModel::factory()->create(), ['*'], 'admin_api');

    $this->postJson("/api/v1/admin/brands/{$brand->id}/approve")
        ->assertOk()
        ->assertJsonPath('data.status', 'active');

    expect($brand->refresh()->status)->toBe(BrandStatusEnum::Active);
});

it('treats approving an active brand as a no-op and 404s for an unknown brand', function (): void {
    $brand = BrandModel::factory()->create();
    Sanctum::actingAs(AdminModel::factory()->create(), ['*'], 'admin_api');

    $this->postJson("/api/v1/admin/brands/{$brand->id}/approve")->assertOk();
    $this->postJson('/api/v1/admin/brands/'.fake()->uuid().'/approve')->assertNotFound();
});

it('forbids non-admins from approving', function (): void {
    $brand = BrandModel::factory()->pending()->create();

    $this->postJson("/api/v1/admin/brands/{$brand->id}/approve")->assertUnauthorized();

    $this->actingAs($brand->owner, 'client');
    $this->postJson("/api/v1/admin/brands/{$brand->id}/approve")->assertStatus(401);
    expect($brand->refresh()->status)->toBe(BrandStatusEnum::Pending);
});

it('lets a dashboard admin approve but not a brand owner', function (): void {
    $brand = BrandModel::factory()->pending()->create();

    $this->authenticateDashboardActor($brand->owner)
        ->patchJson("/api/v1/dashboard/admin/brands/{$brand->id}/approve")
        ->assertForbidden();
    expect($brand->refresh()->status)->toBe(BrandStatusEnum::Pending);

    $this->authenticateDashboardActor(AdminModel::factory()->create())
        ->patchJson("/api/v1/dashboard/admin/brands/{$brand->id}/approve")
        ->assertOk()
        ->assertJsonPath('data.status', 'active');
});
