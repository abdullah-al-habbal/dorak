<?php

declare(strict_types=1);

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\ProductCatalog\Models\BranchCatalogSettingModel;
use Modules\ProductCatalog\Models\BranchProductModel;
use Modules\ProductCatalog\Models\ProductMediumModel;
use Modules\ProductCatalog\Models\ProductModel;
use Modules\ProductCatalog\Models\StockAdjustmentModel;

function catalogListingAt(BranchModel $branch, ?ProductModel $product = null, array $attributes = []): BranchProductModel
{
    $factory = BranchProductModel::factory()->forBranch($branch);

    return $factory->create(array_merge(
        $product instanceof ProductModel ? ['product_id' => $product->getKey()] : [],
        $attributes,
    ));
}

it('stores a brand-owned product with bilingual text and bounded metadata', function (): void {
    $product = ProductModel::factory()->create([
        'name' => ['en' => 'Shampoo', 'ar' => 'شامبو'],
        'metadata' => ['size_ml' => 250],
    ])->fresh();

    expect($product->getTranslation('name', 'ar'))->toBe('شامبو')
        ->and($product->metadata)->toBe(['size_ml' => 250])
        ->and($product->is_active)->toBeTrue()
        ->and($product->brand)->toBeInstanceOf(BrandModel::class);
});

it('keeps price publication and stock per branch for a shared product', function (): void {
    $brand = BrandModel::factory()->create();
    $branchA = BranchModel::factory()->create(['brand_id' => $brand->getKey()]);
    $branchB = BranchModel::factory()->create(['brand_id' => $brand->getKey()]);
    $product = ProductModel::factory()->create(['brand_id' => $brand->getKey()]);

    $listingA = catalogListingAt($branchA, $product, ['price_amount_minor' => 5000, 'stock_quantity' => 6, 'is_published' => true]);
    $listingB = catalogListingAt($branchB, $product, ['price_amount_minor' => 7000, 'stock_quantity' => 0]);

    $listingA->update(['price_amount_minor' => 5500, 'stock_quantity' => 5]);

    expect($listingB->fresh()->price_amount_minor)->toBe(7000)
        ->and($listingB->fresh()->stock_quantity)->toBe(0)
        ->and($listingB->fresh()->is_published)->toBeFalse()
        ->and($product->listings()->count())->toBe(2);
});

it('allows only one listing per product and branch', function (): void {
    $branch = BranchModel::factory()->create();
    $listing = catalogListingAt($branch);

    expect(fn () => catalogListingAt($branch, $listing->product))->toThrow(QueryException::class);
});

it('distinguishes unknown stock from zero stock', function (): void {
    $branch = BranchModel::factory()->create();
    $unknown = catalogListingAt($branch)->fresh();
    $zero = catalogListingAt($branch, null, ['stock_quantity' => 0])->fresh();

    expect($unknown->stock_quantity)->toBeNull()
        ->and($unknown->stock_confirmed_at)->toBeNull()
        ->and($zero->stock_quantity)->toBe(0);
});

it('rejects a negative stock quantity and a negative price at the database', function (): void {
    $listing = catalogListingAt(BranchModel::factory()->create());

    expect(fn () => DB::table('branch_products')->where('id', $listing->getKey())->update(['stock_quantity' => -1]))
        ->toThrow(QueryException::class)
        ->and(fn () => DB::table('branch_products')->where('id', $listing->getKey())->update(['price_amount_minor' => -1]))
        ->toThrow(QueryException::class);
});

it('starts a listing at version one and never mass-assigns the version', function (): void {
    $listing = catalogListingAt(BranchModel::factory()->create())->fresh();

    expect($listing->version)->toBe(1);

    $listing->fill(['version' => 9]);

    expect($listing->version)->toBe(1);
});

it('rejects a listing with an unknown currency', function (): void {
    expect(fn () => catalogListingAt(BranchModel::factory()->create(), null, ['currency_code' => 'ZZZZZ']))
        ->toThrow(QueryException::class);
});

it('removes listings with their branch but keeps the product and its other listings', function (): void {
    $brand = BrandModel::factory()->create();
    $branchA = BranchModel::factory()->create(['brand_id' => $brand->getKey()]);
    $branchB = BranchModel::factory()->create(['brand_id' => $brand->getKey()]);
    $product = ProductModel::factory()->create(['brand_id' => $brand->getKey()]);
    catalogListingAt($branchA, $product);
    $listingB = catalogListingAt($branchB, $product);

    $branchA->delete();

    expect(ProductModel::query()->whereKey($product->getKey())->exists())->toBeTrue()
        ->and(BranchProductModel::query()->where('product_id', $product->getKey())->pluck('id')->all())->toBe([$listingB->getKey()]);
});

it('removes media listings and the ledger with their product and products with their brand', function (): void {
    $branch = BranchModel::factory()->create();
    $listing = catalogListingAt($branch);
    ProductMediumModel::factory()->create(['product_id' => $listing->product_id]);
    StockAdjustmentModel::factory()->create(['branch_product_id' => $listing->getKey()]);

    BrandModel::query()->whereKey($branch->brand_id)->firstOrFail()->delete();

    expect(ProductModel::query()->count())->toBe(0)
        ->and(ProductMediumModel::query()->count())->toBe(0)
        ->and(BranchProductModel::query()->count())->toBe(0)
        ->and(StockAdjustmentModel::query()->count())->toBe(0);
});

it('orders product media by sort order', function (): void {
    $product = ProductModel::factory()->create();
    ProductMediumModel::factory()->create(['product_id' => $product->getKey(), 'sort_order' => 2, 'image_path' => 'b.jpg']);
    ProductMediumModel::factory()->create(['product_id' => $product->getKey(), 'sort_order' => 1, 'image_path' => 'a.jpg']);

    expect($product->media->pluck('image_path')->all())->toBe(['a.jpg', 'b.jpg']);
});

it('records stock adjustments with unknown quantities and an actor', function (): void {
    $listing = catalogListingAt(BranchModel::factory()->create());

    $entry = StockAdjustmentModel::factory()->create([
        'branch_product_id' => $listing->getKey(),
        'actor_type' => StatusChangeActorTypeEnum::Branch,
        'actor_id' => $listing->branch_id,
        'quantity_before' => null,
        'quantity_after' => 4,
        'version_after' => 2,
        'reason' => 'recount',
    ])->fresh();

    expect($entry->quantity_before)->toBeNull()
        ->and($entry->quantity_after)->toBe(4)
        ->and($entry->actor_type)->toBe(StatusChangeActorTypeEnum::Branch)
        ->and($entry->created_at)->not->toBeNull()
        ->and($entry->updated_at)->toBeNull()
        ->and($listing->adjustments()->count())->toBe(1);
});

it('disables the catalog for a branch by default and allows one setting per branch', function (): void {
    $branch = BranchModel::factory()->create();

    expect(BranchCatalogSettingModel::query()->active()->where('branch_id', $branch->getKey())->exists())->toBeFalse();

    BranchCatalogSettingModel::factory()->create(['branch_id' => $branch->getKey(), 'is_active' => true]);

    expect(BranchCatalogSettingModel::query()->active()->where('branch_id', $branch->getKey())->exists())->toBeTrue()
        ->and(fn () => BranchCatalogSettingModel::factory()->create(['branch_id' => $branch->getKey()]))
        ->toThrow(QueryException::class);
});

it('stores an inactive setting without activating the catalog', function (): void {
    $setting = BranchCatalogSettingModel::factory()->inactive()->create()->fresh();

    expect($setting->is_active)->toBeFalse()
        ->and(BranchCatalogSettingModel::query()->active()->count())->toBe(0);
});
