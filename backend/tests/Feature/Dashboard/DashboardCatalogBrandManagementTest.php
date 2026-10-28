<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

beforeEach(function (): void {
    config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
});

function catalogPayload(string $categoryId, array $overrides = []): array
{
    return [
        'category_id' => $categoryId,
        'name' => ['en' => 'Fade', 'ar' => 'فيد'],
        'slug' => 'fade-cut',
        'is_active' => true,
        'face_shapes' => ['oval'],
        'default_duration_minutes' => 30,
        ...$overrides,
    ];
}

describe('Dashboard service catalog management', function (): void {
    it('lets an admin create, update, list and delete a catalog item', function (): void {
        $category = ServiceCatalogCategoryModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $id = $this->postJson('/api/v1/dashboard/admin/catalog-items', catalogPayload($category->id))
            ->assertCreated()
            ->assertJsonPath('data.slug', 'fade-cut')
            ->json('data.id');

        $this->getJson('/api/v1/dashboard/admin/catalog-items')->assertOk()->assertJsonPath('data.0.id', $id);
        $this->putJson("/api/v1/dashboard/admin/catalog-items/{$id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);
        $this->getJson('/api/v1/dashboard/admin/catalog-categories')->assertOk();
        $this->getJson('/api/v1/dashboard/admin/catalog-tags')->assertOk();
        $this->deleteJson("/api/v1/dashboard/admin/catalog-items/{$id}")->assertOk();
        expect(ServiceCatalogItemModel::query()->find($id))->toBeNull();
    });

    it('forbids managers, owners and barbers from every catalog route', function (): void {
        $category = ServiceCatalogCategoryModel::factory()->create();
        $item = ServiceCatalogItemModel::factory()->create();
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);

        foreach ([BranchModel::factory()->create(), $owner] as $actor) {
            $this->authenticateDashboardActor($actor);
            $this->postJson('/api/v1/dashboard/admin/catalog-items', catalogPayload($category->id))->assertForbidden();
            $this->putJson("/api/v1/dashboard/admin/catalog-items/{$item->id}", ['is_active' => false])->assertForbidden();
            $this->deleteJson("/api/v1/dashboard/admin/catalog-items/{$item->id}")->assertForbidden();
        }
        expect($item->fresh())->not->toBeNull();
    });

    it('lets a dashboard service link to a catalog item', function (): void {
        $item = ServiceCatalogItemModel::factory()->create(['is_active' => true]);
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $this->authenticateDashboardActor($owner);

        $this->postJson('/api/v1/dashboard/services', [
            'serviceable_id' => $brand->id,
            'serviceable_type' => 'brand',
            'catalog_item_id' => $item->id,
            'currency_id' => CurrencyModel::factory()->create()->id,
            'name' => ['en' => 'Fade', 'ar' => 'فيد'],
            'price' => 20,
        ])->assertCreated()->assertJsonPath('data.catalog_item_id', $item->id);
    });
});

describe('Dashboard brand management', function (): void {
    it('lets an owner list, edit and create only their own brands', function (): void {
        $owner = ClientModel::factory()->create();
        $mine = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $foreign = BrandModel::factory()->create();
        $this->authenticateDashboardActor($owner);

        $this->getJson('/api/v1/dashboard/brands')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $mine->id);
        $this->getJson("/api/v1/dashboard/brands/{$mine->id}")->assertOk();
        $this->putJson("/api/v1/dashboard/brands/{$mine->id}", ['name' => ['en' => 'Renamed']])->assertOk();
        expect($mine->fresh()->getTranslation('name', 'en'))->toBe('Renamed');

        $this->getJson("/api/v1/dashboard/brands/{$foreign->id}")->assertNotFound();
        $this->putJson("/api/v1/dashboard/brands/{$foreign->id}", ['name' => ['en' => 'Hijack']])->assertForbidden();

        $this->postJson('/api/v1/dashboard/brands', [
            'name' => ['en' => 'New', 'ar' => 'جديد'],
            'base_currency_id' => CurrencyModel::factory()->create()->id,
        ])->assertCreated()->assertJsonPath('data.owner.id', $owner->id);
    });

    it('lets an admin list and edit any brand but not create one', function (): void {
        $brand = BrandModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson('/api/v1/dashboard/brands')->assertOk()->assertJsonCount(1, 'data');
        $this->putJson("/api/v1/dashboard/brands/{$brand->id}", ['name' => ['en' => 'Admin edit']])->assertOk();
        expect($brand->fresh()->getTranslation('name', 'en'))->toBe('Admin edit');
        $this->postJson('/api/v1/dashboard/brands', [
            'name' => ['en' => 'X', 'ar' => 'س'],
            'base_currency_id' => CurrencyModel::factory()->create()->id,
        ])->assertForbidden();
    });

    it('forbids a branch manager from brand management', function (): void {
        $brand = BrandModel::factory()->create();
        $this->authenticateDashboardActor(BranchModel::factory()->create(['brand_id' => $brand->id]));

        $this->getJson('/api/v1/dashboard/brands')->assertForbidden();
        $this->putJson("/api/v1/dashboard/brands/{$brand->id}", ['name' => ['en' => 'No']])->assertForbidden();
        expect($brand->fresh()->getTranslation('name', 'en'))->not->toBe('No');
    });
});
