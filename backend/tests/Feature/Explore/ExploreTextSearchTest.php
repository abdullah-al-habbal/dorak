<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

const SEARCH_URL = '/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=1000&universe=men';

function searchableBranch(string $en, string $ar = 'فرع', ?BrandModel $brand = null): BranchModel
{
    return BranchModel::factory()->create([
        'name' => ['en' => $en, 'ar' => $ar],
        'latitude' => 33.5,
        'longitude' => 36.3,
        'brand_id' => ($brand ?? BrandModel::factory()->create(['universe' => 'men', 'name' => ['en' => 'Generic Brand', 'ar' => 'علامة']]))->id,
    ]);
}

function branchSearchIds(string $query): array
{
    return test()->getJson(SEARCH_URL.'&q='.urlencode($query))->assertOk()->json('data.*.id');
}

it('matches a fragment of the branch name, case-insensitively', function (): void {
    $royal = searchableBranch('The Royal Barber');
    searchableBranch('Fade Factory');

    expect(branchSearchIds('ROYAL'))->toBe([$royal->id]);
});

it('matches the brand name', function (): void {
    $brand = BrandModel::factory()->create(['universe' => 'men', 'name' => ['en' => 'Gentlemen Club', 'ar' => 'نادي السادة']]);
    $first = searchableBranch('Downtown', 'وسط البلد', $brand);
    $second = searchableBranch('Uptown', 'أعلى البلد', $brand);
    searchableBranch('Elsewhere');

    expect(branchSearchIds('gentlemen'))->toEqualCanonicalizing([$first->id, $second->id]);
});

it('matches Arabic names', function (): void {
    $arabic = searchableBranch('Old Town', 'صالون الملك');
    searchableBranch('New Town', 'صالون الأمير');

    expect(branchSearchIds('الملك'))->toBe([$arabic->id]);
});

it('matches offered service and catalog tag names', function (): void {
    $withService = searchableBranch('Plain One');
    OfferedServiceModel::factory()->create([
        'serviceable_type' => 'branch',
        'serviceable_id' => $withService->id,
        'name' => ['en' => 'Beard Sculpting', 'ar' => 'تشكيل اللحية'],
        'active' => true,
    ]);

    $withTag = searchableBranch('Plain Two');
    $item = ServiceCatalogItemModel::factory()->create(['is_active' => true]);
    $tag = ServiceCatalogItemTagModel::factory()->create(['name' => ['en' => 'Skin Fade', 'ar' => 'تدريج'], 'is_active' => true]);
    DB::table('service_catalog_item_tag_assignments')->insert(['id' => (string) Str::uuid7(), 'item_id' => $item->id, 'tag_id' => $tag->id, 'created_at' => now(), 'updated_at' => now()]);
    OfferedServiceModel::factory()->create([
        'serviceable_type' => 'branch',
        'serviceable_id' => $withTag->id,
        'catalog_item_id' => $item->id,
        'active' => true,
    ]);

    expect(branchSearchIds('sculpt'))->toBe([$withService->id])
        ->and(branchSearchIds('skin fade'))->toBe([$withTag->id]);

    $byTagId = $this->getJson(SEARCH_URL.'&tag_ids[]='.$tag->id)->assertOk()->json('data.*.id');
    expect($byTagId)->toBe([$withTag->id]);
});

it('treats LIKE wildcards in the query literally', function (): void {
    searchableBranch('Royal Cuts');

    expect(branchSearchIds('%'))->toBe([])
        ->and(branchSearchIds('_'))->toBe([]);
});

it('rejects a query longer than 100 characters', function (): void {
    $this->getJson(SEARCH_URL.'&q='.str_repeat('a', 101))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['q']);
});

it('searches barbers by name and service', function (): void {
    $karim = BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5, 'longitude' => 36.3, 'name' => ['en' => 'Karim Fades', 'ar' => 'كريم']]);
    $omar = BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5, 'longitude' => 36.3, 'name' => ['en' => 'Omar', 'ar' => 'عمر']]);
    OfferedServiceModel::factory()->create([
        'serviceable_type' => 'barber',
        'serviceable_id' => $omar->id,
        'name' => ['en' => 'Hot Towel Shave', 'ar' => 'حلاقة بالمنشفة الساخنة'],
        'active' => true,
    ]);

    $url = '/api/v1/explore/barbers?latitude=33.5&longitude=36.3&radius=1000&q=';
    expect($this->getJson($url.'karim')->assertOk()->json('data.*.id'))->toBe([$karim->id])
        ->and($this->getJson($url.urlencode('towel'))->assertOk()->json('data.*.id'))->toBe([$omar->id]);
});

it('matches branch tags in English and Arabic', function (): void {
    $kids = searchableBranch('Little Cuts');
    $kids->update(['tags' => ['Kids', 'أطفال']]);
    searchableBranch('Grown Ups');

    expect(branchSearchIds('kids'))->toBe([$kids->id])
        ->and(branchSearchIds('أطفال'))->toBe([$kids->id]);
});
