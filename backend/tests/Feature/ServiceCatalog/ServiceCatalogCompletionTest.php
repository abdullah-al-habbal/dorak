<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Enums\VenueUniverse;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

beforeEach(function () {
    $this->category = ServiceCatalogCategoryModel::factory()->create();
    $this->admin = AdminModel::factory()->create();
});

it('rejects an invalid face_shapes value with 422 and accepts a valid one with 201', function () {
    $payload = [
        'category_id' => $this->category->id,
        'name' => ['en' => 'Taper', 'ar' => 'تيبر'],
        'slug' => 'taper',
        'is_active' => true,
        'face_shapes' => ['triangle-x'],
    ];

    $this->authenticateDashboardActor($this->admin)
        ->postJson('/api/v1/dashboard/admin/catalog-items', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['face_shapes.0']);

    $payload['face_shapes'] = ['oval'];
    $this->authenticateDashboardActor($this->admin)
        ->postJson('/api/v1/dashboard/admin/catalog-items', $payload)
        ->assertCreated();
});

it('persists tag_ids on create and returns a tags array', function () {
    $tag = ServiceCatalogItemTagModel::factory()->create();

    $response = $this->authenticateDashboardActor($this->admin)
        ->postJson('/api/v1/dashboard/admin/catalog-items', [
            'category_id' => $this->category->id,
            'name' => ['en' => 'Fade', 'ar' => 'فيد'],
            'slug' => 'fade',
            'is_active' => true,
            'tag_ids' => [$tag->id],
        ]);

    $response->assertCreated();
    $response->assertJsonPath('data.tags.0.id', $tag->id);
    $itemId = $response->json('data.id');
    $this->assertDatabaseHas('service_catalog_item_tag_assignments', [
        'item_id' => $itemId,
        'tag_id' => $tag->id,
    ]);
});

it('excludes inactive items from the client list but includes them for an admin', function () {
    ServiceCatalogItemModel::factory()->create(['category_id' => $this->category->id, 'is_active' => true]);
    ServiceCatalogItemModel::factory()->inactive()->create(['category_id' => $this->category->id]);

    $clientResponse = $this->getJson('/api/v1/service-catalog/items');
    expect($clientResponse->json('data'))->toHaveCount(1);

    $adminResponse = $this->actingAs($this->admin, 'admin_api')
        ->getJson('/api/v1/service-catalog/items');
    expect($adminResponse->json('data'))->toHaveCount(2);
});

it('filters by face_shape, tag and universe', function () {
    $tag = ServiceCatalogItemTagModel::factory()->create();
    $menCategory = ServiceCatalogCategoryModel::factory()->create(['universe' => VenueUniverse::Men]);

    $matching = ServiceCatalogItemModel::factory()->create([
        'category_id' => $menCategory->id,
        'face_shapes' => ['oval'],
    ]);
    $matching->tags()->attach($tag->id);

    ServiceCatalogItemModel::factory()->create([
        'category_id' => $this->category->id,
        'face_shapes' => ['round'],
    ]);

    $this->getJson('/api/v1/service-catalog/items?face_shape=oval')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $matching->id);

    $this->getJson('/api/v1/service-catalog/items?tag='.$tag->slug)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $matching->id);

    $this->getJson('/api/v1/service-catalog/items?universe=men')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $matching->id);
});

it('returns 200 for the categories list', function () {
    $this->getJson('/api/v1/service-catalog/categories')
        ->assertOk()
        ->assertJsonStructure(['data' => ['*' => ['id', 'name', 'slug', 'universe']]]);
});

it('rejects a dashboard service referencing an inactive catalog item with 422', function () {
    $inactiveItem = ServiceCatalogItemModel::factory()->inactive()->create(['category_id' => $this->category->id]);
    $branch = BranchModel::factory()->create();
    $currency = CurrencyModel::factory()->create();
    $this->authenticateDashboardActor($branch);

    $response = $this->postJson('/api/v1/dashboard/services', [
        'serviceable_id' => $branch->brand_id,
        'serviceable_type' => ServiceableTypeEnum::Brand,
        'catalog_item_id' => $inactiveItem->id,
        'currency_code' => $currency->code,
        'name' => ['en' => 'Haircut', 'ar' => 'قص الشعر'],
        'price_amount_minor' => 5000,
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors(['catalog_item_id']);
});

it('rejects a barber service referencing an inactive catalog item with 422', function () {
    $inactiveItem = ServiceCatalogItemModel::factory()->inactive()->create(['category_id' => $this->category->id]);
    $barber = BarberModel::factory()->create();
    $currency = CurrencyModel::factory()->create();

    $response = $this->actingAs($barber, 'barber')
        ->postJson('/api/v1/barber/services', [
            'catalog_item_id' => $inactiveItem->id,
            'currency_code' => $currency->code,
            'name' => ['en' => 'Haircut', 'ar' => 'قص الشعر'],
            'price_amount_minor' => 5000,
        ]);

    $response->assertStatus(422)->assertJsonValidationErrors(['catalog_item_id']);
});
