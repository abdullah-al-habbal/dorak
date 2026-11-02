<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Enums\VenueUniverse;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

it('returns string UUID ids for catalog items, categories and tags', function () {
    $item = ServiceCatalogItemModel::factory()->create();
    $tag = ServiceCatalogItemTagModel::factory()->create();
    $item->tags()->attach($tag);

    $response = $this->getJson('/api/v1/service-catalog/items');

    $response->assertOk()
        ->assertJsonPath('data.0.id', $item->id)
        ->assertJsonPath('data.0.category_id', $item->category_id)
        ->assertJsonPath('data.0.category.id', $item->category_id)
        ->assertJsonPath('data.0.tags.0.id', $tag->id);
    expect(Str::isUuid($response->json('data.0.id')))->toBeTrue()
        ->and(Str::isUuid($response->json('data.0.category.id')))->toBeTrue()
        ->and(Str::isUuid($response->json('data.0.tags.0.id')))->toBeTrue()
        ->and(Str::isUuid((string) DB::table('service_catalog_item_tag_assignments')->value('id')))->toBeTrue();
});

it('shows a catalog item by UUID and filters the list by category UUID', function () {
    $category = ServiceCatalogCategoryModel::factory()->create();
    $item = ServiceCatalogItemModel::factory()->create(['category_id' => $category->id]);
    ServiceCatalogItemModel::factory()->create();

    $this->getJson("/api/v1/service-catalog/items/{$item->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $item->id);
    $this->getJson("/api/v1/service-catalog/items?category_id={$category->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $item->id);
    $this->getJson('/api/v1/service-catalog/items?category_id=1')->assertUnprocessable();
});

it('links a dashboard service to a catalog item by UUID', function () {
    $item = ServiceCatalogItemModel::factory()->create();
    $branch = BranchModel::factory()->create();
    $currency = CurrencyModel::factory()->create();
    $this->authenticateDashboardActor(AdminModel::factory()->create());

    $response = $this->postJson('/api/v1/dashboard/services', [
        'serviceable_id' => $branch->brand_id,
        'serviceable_type' => ServiceableTypeEnum::Brand,
        'catalog_item_id' => $item->id,
        'currency_code' => $currency->code,
        'name' => ['en' => 'Haircut', 'ar' => 'قص شعر'],
        'price_amount_minor' => 2500,
        'duration_minutes' => 30,
        'is_active' => true,
    ]);

    $response->assertCreated()->assertJsonPath('data.catalog_item_id', $item->id);
    expect(OfferedServiceModel::query()->findOrFail($response->json('data.id'))->catalog_item_id)->toBe($item->id);
});

it('filters explore branches by catalog item UUID', function () {
    $brand = BrandModel::factory()->create(['universe' => VenueUniverse::Men]);
    $otherBrand = BrandModel::factory()->create(['universe' => VenueUniverse::Men]);
    $item = ServiceCatalogItemModel::factory()->create();
    $otherItem = ServiceCatalogItemModel::factory()->create();
    $matching = BranchModel::factory()->create(['latitude' => 33.5, 'longitude' => 36.3, 'brand_id' => $brand->id]);
    $other = BranchModel::factory()->create(['latitude' => 33.5, 'longitude' => 36.3, 'brand_id' => $otherBrand->id]);
    OfferedServiceModel::factory()->create(['serviceable_id' => $brand->id, 'catalog_item_id' => $item->id, 'is_active' => true]);
    OfferedServiceModel::factory()->create(['serviceable_id' => $otherBrand->id, 'catalog_item_id' => $otherItem->id, 'is_active' => true]);

    $this->getJson("/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=1000&universe=men&per_page=10&catalog_item_ids[]={$item->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $matching->id);
    $this->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=1000&universe=men&per_page=10&catalog_item_ids[]=1')
        ->assertUnprocessable();
});
