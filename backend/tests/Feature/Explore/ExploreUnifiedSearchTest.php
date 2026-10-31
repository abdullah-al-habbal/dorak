<?php

declare(strict_types=1);

use Laravel\Pennant\Feature;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientRecommendation\Constants\RecommendationConstants;
use Modules\ClientRecommendation\Enums\EdgeTypeEnum;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;

const UNIFIED_URL = '/api/v1/explore/search?latitude=33.5&longitude=36.3&radius=50';

function unifiedSearch(string $query = ''): array
{
    return test()->getJson(UNIFIED_URL.$query)->assertOk()->json('data');
}

it('returns branches and freelancers in one list, nearest first', function (): void {
    $farBranch = BranchModel::factory()->create(['latitude' => 33.6, 'longitude' => 36.3]);
    $nearFreelancer = BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.501, 'longitude' => 36.3]);
    $nearBranch = BranchModel::factory()->create(['latitude' => 33.5, 'longitude' => 36.3]);
    BranchModel::factory()->create(['latitude' => 40.0, 'longitude' => 40.0]);

    $items = unifiedSearch();

    expect(array_map(fn (array $item) => [$item['type'], $item['entity']['id']], $items))->toBe([
        ['branch', $nearBranch->id],
        ['barber', $nearFreelancer->id],
        ['branch', $farBranch->id],
    ]);
    expect($items[0]['distance'])->toBeLessThan($items[1]['distance'])
        ->and($items[1]['entity'])->toHaveKeys(['name', 'is_freelancer', 'rating_avg']);
});

it('never lists shop-employed barbers as standalone results', function (): void {
    BarberModel::factory()->create(['is_freelancer' => false, 'latitude' => 33.5, 'longitude' => 36.3]);

    expect(unifiedSearch())->toBe([]);
});

it('finds a freelancer without a location by text, whatever the radius', function (): void {
    $mobile = BarberModel::factory()->create([
        'is_freelancer' => true, 'latitude' => null, 'longitude' => null,
        'name' => ['en' => 'Karim Mobile Cuts', 'ar' => 'كريم'],
    ]);
    $located = BranchModel::factory()->create(['latitude' => 33.5, 'longitude' => 36.3, 'name' => ['en' => 'Karim Studio', 'ar' => 'استوديو كريم']]);

    $items = unifiedSearch('&q=karim');

    expect(array_map(fn (array $item) => $item['entity']['id'], $items))->toBe([$located->id, $mobile->id])
        ->and($items[1]['distance'])->toBeNull();
});

it('keeps location-less freelancers out of a purely geographic search', function (): void {
    BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => null, 'longitude' => null]);

    expect(unifiedSearch())->toBe([]);
});

it('applies the shared filters to both result types', function (): void {
    BranchModel::factory()->create(['latitude' => 33.5, 'longitude' => 36.3, 'universe' => 'men']);
    $womenBranch = BranchModel::factory()->create(['latitude' => 33.5, 'longitude' => 36.3, 'universe' => 'women']);
    BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5, 'longitude' => 36.3, 'universe' => 'men']);

    $ids = array_map(fn (array $item) => $item['entity']['id'], unifiedSearch('&universe=women'));

    expect($ids)->toBe([$womenBranch->id]);
});

it('paginates the merged list', function (): void {
    foreach (range(1, 3) as $i) {
        BranchModel::factory()->create(['latitude' => 33.5 + $i / 1000, 'longitude' => 36.3]);
        BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5 + $i / 1000 + 0.0005, 'longitude' => 36.3]);
    }

    $response = $this->getJson(UNIFIED_URL.'&per_page=4&page=2')->assertOk();

    expect($response->json('data'))->toHaveCount(2)
        ->and($response->json('meta.pagination.total'))->toBe(6)
        ->and($response->json('meta.pagination.current_page'))->toBe(2);
});

it('validates the location parameters', function (): void {
    $this->getJson('/api/v1/explore/search?q=karim')
        ->assertStatus(422)
        ->assertJsonValidationErrors(['latitude', 'longitude', 'radius']);
});

it('ranks shops and freelancers together for a signed-in client', function (): void {
    Feature::define('explore-ranking', fn () => RecommendationConstants::RECOMMENDATION_EXPLORE_RANKING_VARIANT_DEFAULT);
    $nearBranch = BranchModel::factory()->create(['latitude' => 33.5, 'longitude' => 36.3]);
    $favourite = BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.7, 'longitude' => 36.3]);
    $client = ClientModel::factory()->create();
    RecommendationEdgeModel::create([
        'source_type' => 'client', 'source_id' => $client->id,
        'target_type' => 'barber', 'target_id' => $favourite->id,
        'edge_type' => EdgeTypeEnum::Favorite, 'weight' => 1.0,
    ]);

    $items = $this->actingAs($client, 'client')->getJson(UNIFIED_URL)->assertOk()->json('data');

    expect(array_map(fn (array $item) => $item['entity']['id'], $items))->toBe([$favourite->id, $nearBranch->id])
        ->and($items[0]['entity']['rank'])->toBe(1);
});
