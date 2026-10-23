<?php

declare(strict_types=1);

use Laravel\Pennant\Feature;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Models\ClientFaceAnalysisResultModel;
use Modules\ClientRecommendation\Constants\RecommendationConstants;
use Modules\ClientRecommendation\Enums\EdgeTypeEnum;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

beforeEach(function (): void {
    Feature::define('explore-ranking', fn () => RecommendationConstants::EXPLORE_RANKING_VARIANT_DEFAULT);
});

const RANKING_URL = '/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=100&per_page=3';

/** @return list<BranchModel> branches ordered nearest first */
function rankedBranches(int $count): array
{
    return array_map(
        fn (int $i): BranchModel => BranchModel::factory()->create(['latitude' => 33.5 + $i * 0.01, 'longitude' => 36.3]),
        range(0, $count - 1),
    );
}

function favour(ClientModel $client, BranchModel $branch): void
{
    RecommendationEdgeModel::create([
        'source_type' => 'client',
        'source_id' => $client->id,
        'target_type' => 'branch',
        'target_id' => $branch->id,
        'edge_type' => EdgeTypeEnum::Favorite,
        'weight' => 1.0,
    ]);
}

function branchWithFaceShapeService(BranchModel $branch, string $shape): void
{
    $item = ServiceCatalogItemModel::factory()->create(['is_active' => true, 'face_shapes' => [$shape]]);
    OfferedServiceModel::factory()->create([
        'serviceable_type' => 'branch',
        'serviceable_id' => $branch->id,
        'catalog_item_id' => $item->id,
        'active' => true,
    ]);
}

it('ranks the whole candidate set before paginating', function (): void {
    $branches = rankedBranches(6);
    $client = ClientModel::factory()->create();
    favour($client, $branches[5]);

    $first = $this->actingAs($client, 'client')->getJson(RANKING_URL)->assertOk();

    expect($first->json('data.0.id'))->toBe($branches[5]->id)
        ->and($first->json('data.0.rank'))->toBe(1)
        ->and($first->json('meta.pagination.total'))->toBe(6);
});

it('keeps rank contiguous across pages', function (): void {
    rankedBranches(6);
    $client = ClientModel::factory()->create();

    $first = $this->actingAs($client, 'client')->getJson(RANKING_URL)->assertOk()->json('data.*.rank');
    $second = $this->actingAs($client, 'client')->getJson(RANKING_URL.'&page=2')->assertOk()->json('data.*.rank');

    expect($first)->toBe([1, 2, 3])->and($second)->toBe([4, 5, 6]);
});

it('orders a guest by distance with ranks and scores', function (): void {
    $branches = rankedBranches(3);

    $response = $this->getJson(RANKING_URL)->assertOk();

    expect($response->json('data.*.id'))->toBe(array_map(fn (BranchModel $b) => $b->id, $branches))
        ->and($response->json('data.*.rank'))->toBe([1, 2, 3])
        ->and($response->json('data.0.compatibility_score'))->toBeGreaterThan($response->json('data.2.compatibility_score'));
});

it('filters on an explicit face_shape_compatible', function (): void {
    [$plain, $oval] = rankedBranches(2);
    branchWithFaceShapeService($oval, 'oval');

    $ids = $this->getJson(RANKING_URL.'&face_shape_compatible=oval')->assertOk()->json('data.*.id');

    expect($ids)->toBe([$oval->id])->not->toContain($plain->id);
});

it('boosts, without filtering, by the client\'s own face analysis', function (): void {
    [$near, $far] = rankedBranches(2);
    branchWithFaceShapeService($far, 'oval');
    $client = ClientModel::factory()->create();
    ClientFaceAnalysisResultModel::query()->create([
        'client_id' => $client->id,
        'analysis_version' => 'v1',
        'analysis_source' => 'third_party_api',
        'detected_face_shape' => 'oval',
        'confidence_score' => 0.9,
        'computed_at' => now(),
    ]);

    $ids = $this->actingAs($client, 'client')->getJson(RANKING_URL)->assertOk()->json('data.*.id');

    expect($ids)->toBe([$far->id, $near->id]);
});

it('ranks freelancers the same way', function (): void {
    $near = BarberModel::factory()->freelancer()->create(['latitude' => 33.5, 'longitude' => 36.3]);
    $favourite = BarberModel::factory()->freelancer()->create(['latitude' => 33.55, 'longitude' => 36.3]);
    $client = ClientModel::factory()->create();
    RecommendationEdgeModel::create([
        'source_type' => 'client', 'source_id' => $client->id,
        'target_type' => 'barber', 'target_id' => $favourite->id,
        'edge_type' => EdgeTypeEnum::Favorite, 'weight' => 1.0,
    ]);

    $ids = $this->actingAs($client, 'client')
        ->getJson('/api/v1/explore/barbers?latitude=33.5&longitude=36.3&radius=100')
        ->assertOk()
        ->json('data.*.id');

    expect($ids)->toBe([$favourite->id, $near->id]);
});
