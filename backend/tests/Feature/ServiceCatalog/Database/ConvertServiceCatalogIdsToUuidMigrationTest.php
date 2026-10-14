<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;

/** Loads the Task 14 catalog rekey migration so a test can run it in either direction. */
function catalogUuidMigration(): object
{
    return require base_path('modules/ServiceCatalog/Database/Migrations/2026_10_14_000001_convert_service_catalog_ids_to_uuid.php');
}

/** Inserts an integer-keyed catalog row and returns its id, as the legacy schema would. */
function insertLegacyCatalogRow(string $table, array $attributes): int
{
    return (int) DB::table($table)->insertGetId(array_merge(['created_at' => now(), 'updated_at' => now()], $attributes));
}

it('rekeys legacy catalog rows to UUIDs and keeps every reference on the same logical item', function () {
    $migration = catalogUuidMigration();
    $migration->down();

    $category = insertLegacyCatalogRow('service_catalog_categories', ['name' => '{"en":"Hair"}', 'slug' => 'hair']);
    $childCategory = insertLegacyCatalogRow('service_catalog_categories', ['name' => '{"en":"Fades"}', 'slug' => 'fades', 'parent_id' => $category]);
    $fade = insertLegacyCatalogRow('service_catalog_items', ['category_id' => $childCategory, 'name' => '{"en":"Fade"}', 'slug' => 'fade']);
    $beard = insertLegacyCatalogRow('service_catalog_items', ['category_id' => $category, 'name' => '{"en":"Beard"}', 'slug' => 'beard']);
    $tag = insertLegacyCatalogRow('service_catalog_item_tags', ['name' => '{"en":"Classic"}', 'slug' => 'classic']);
    insertLegacyCatalogRow('service_catalog_item_tag_assignments', ['item_id' => $beard, 'tag_id' => $tag]);
    insertLegacyCatalogRow('service_catalog_media', ['mediable_type' => 'catalog_item', 'mediable_id' => $fade, 'path' => 'fade.jpg']);

    $branch = BranchModel::factory()->create();
    $currency = CurrencyModel::factory()->create();
    $client = ClientModel::factory()->create();
    $barber = BarberModel::factory()->create();
    $fadeService = (string) Str::uuid();
    $beardService = (string) Str::uuid();
    foreach ([[$fadeService, $fade], [$beardService, $beard]] as [$serviceId, $itemId]) {
        DB::table('offered_services')->insert([
            'id' => $serviceId,
            'serviceable_type' => 'branch',
            'serviceable_id' => $branch->id,
            'catalog_item_id' => $itemId,
            'currency_id' => $currency->id,
            'name' => '{"en":"Service"}',
            'price' => 10,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
    $historyId = (string) Str::uuid();
    DB::table('client_service_histories')->insert([
        'id' => $historyId,
        'client_id' => $client->id,
        'barber_id' => $barber->id,
        'catalog_item_id' => $beard,
        'performed_at' => now(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $filterId = (string) Str::uuid();
    DB::table('client_saved_filters')->insert([
        'id' => $filterId,
        'client_id' => $client->id,
        'name' => 'Mine',
        'filter_config' => json_encode(['catalog_item_ids' => [$fade, $beard, 999_999], 'universe' => 'men']),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $favoriteId = (string) Str::uuid();
    DB::table('client_favorites')->insert([
        'id' => $favoriteId,
        'client_id' => $client->id,
        'favorable_type' => 'catalog_item',
        'favorable_id' => (string) $fade,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $migration->up();

    $itemIds = DB::table('service_catalog_items')->pluck('id', 'slug');
    $categoryIds = DB::table('service_catalog_categories')->pluck('id', 'slug');
    expect($itemIds->every(fn ($id) => Str::isUuid($id)))->toBeTrue()
        ->and($categoryIds->every(fn ($id) => Str::isUuid($id)))->toBeTrue()
        ->and(DB::table('service_catalog_categories')->where('slug', 'fades')->value('parent_id'))->toBe($categoryIds['hair'])
        ->and(DB::table('service_catalog_items')->where('slug', 'fade')->value('category_id'))->toBe($categoryIds['fades'])
        ->and(DB::table('service_catalog_item_tag_assignments')->value('item_id'))->toBe($itemIds['beard'])
        ->and(DB::table('service_catalog_item_tag_assignments')->value('tag_id'))->toBe(DB::table('service_catalog_item_tags')->value('id'))
        ->and(DB::table('service_catalog_media')->value('mediable_id'))->toBe($itemIds['fade'])
        ->and(DB::table('offered_services')->where('id', $fadeService)->value('catalog_item_id'))->toBe($itemIds['fade'])
        ->and(DB::table('offered_services')->where('id', $beardService)->value('catalog_item_id'))->toBe($itemIds['beard'])
        ->and(DB::table('client_service_histories')->where('id', $historyId)->value('catalog_item_id'))->toBe($itemIds['beard'])
        ->and(DB::table('client_favorites')->where('id', $favoriteId)->value('favorable_id'))->toBe($itemIds['fade'])
        ->and(json_decode((string) DB::table('client_saved_filters')->where('id', $filterId)->value('filter_config'), true))
        ->toBe(['catalog_item_ids' => [$itemIds['fade'], $itemIds['beard']], 'universe' => 'men']);
});
