<?php

declare(strict_types=1);

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Str;
use Laravel\Ai\Embeddings;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Enums\AnalysisSourceEnum;
use Modules\ClientFaceProfile\Enums\DetectedFaceShapeEnum;
use Modules\ClientFaceProfile\Enums\FaceAnalysisStatusEnum;
use Modules\ClientFaceProfile\Models\ClientFaceAnalysisResultModel;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\ClientInteraction\Enums\FavoritedTypeEnum;
use Modules\ClientInteraction\Enums\InteractionTypeEnum;
use Modules\ClientInteraction\Models\ClientFavoriteModel;
use Modules\ClientInteraction\Models\ClientInteractionLogModel;
use Modules\ClientRecommendation\Enums\EdgeTypeEnum;
use Modules\ClientRecommendation\Models\ClientPreferenceVectorModel;
use Modules\ClientRecommendation\Models\EntityEmbeddingModel;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

beforeEach(function () {
    Embeddings::fake();
});

it('recomputes only the given clients vector and never filters entities by the client uuid', function () {
    $client = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create();
    ClientFavoriteModel::create(['client_id' => $client->id, 'favorited_id' => $brand->id, 'favorited_type' => FavoritedTypeEnum::Brand]);
    BranchModel::factory()->create();
    BarberModel::factory()->create();

    $this->artisan('recommend:recompute-vectors', ['--client-id' => $client->id, '--force' => true])
        ->assertExitCode(0);

    expect(ClientPreferenceVectorModel::where('client_id', $client->id)->exists())->toBeTrue();
    expect(EntityEmbeddingModel::count())->toBe(0);
});

it('skips a client with no new signals since the last run unless forced', function () {
    $client = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create();
    ClientFavoriteModel::create(['client_id' => $client->id, 'favorited_id' => $brand->id, 'favorited_type' => FavoritedTypeEnum::Brand]);

    $this->artisan('recommend:recompute-vectors', ['--client-id' => $client->id, '--force' => true])->assertExitCode(0);
    $firstRunAt = ClientPreferenceVectorModel::where('client_id', $client->id)->first()->updated_at;

    $this->travel(1)->minutes();
    $this->artisan('recommend:recompute-vectors', ['--client-id' => $client->id])->assertExitCode(0);
    $secondRunAt = ClientPreferenceVectorModel::where('client_id', $client->id)->first()->updated_at;
    expect($secondRunAt->equalTo($firstRunAt))->toBeTrue();

    $this->artisan('recommend:recompute-vectors', ['--client-id' => $client->id, '--force' => true])->assertExitCode(0);
    $thirdRunAt = ClientPreferenceVectorModel::where('client_id', $client->id)->first()->updated_at;
    expect($thirdRunAt->equalTo($firstRunAt))->toBeFalse();
});

it('removes expired edges and vectors of clients that no longer exist on every run', function () {
    $client = ClientModel::factory()->create();
    RecommendationEdgeModel::create([
        'source_type' => 'client',
        'source_id' => $client->id,
        'target_type' => 'brand',
        'target_id' => (string) Str::uuid(),
        'edge_type' => EdgeTypeEnum::Favorite->value,
        'weight_ratio' => 1.0,
        'expires_at' => now()->subDay(),
    ]);

    $orphanedClient = ClientModel::factory()->create();
    $vector = ClientPreferenceVectorModel::create(['client_id' => $orphanedClient->id, 'embedding' => Embeddings::fakeEmbedding(1536), 'computed_at' => now()]);
    $orphanedClient->forceDelete();

    $this->artisan('recommend:recompute-vectors')->assertExitCode(0);

    expect(RecommendationEdgeModel::where('source_id', $client->id)->exists())->toBeFalse();
    expect(ClientPreferenceVectorModel::whereKey($vector->id)->exists())->toBeFalse();
});

it('builds a history edge from a completed booking after a recompute', function () {
    $booking = BookingModel::factory()->create();
    BookingModel::withoutEvents(fn () => $booking->update(['booking_status' => BookingStatus::Completed]));

    expect(RecommendationEdgeModel::where('source_id', $booking->client_id)->where('edge_type', EdgeTypeEnum::History->value)->exists())->toBeFalse();

    $this->artisan('recommend:recompute-vectors', ['--client-id' => $booking->client_id, '--force' => true])->assertExitCode(0);

    $edge = RecommendationEdgeModel::where('source_type', 'client')
        ->where('source_id', $booking->client_id)
        ->where('target_type', 'barber')
        ->where('target_id', $booking->barber_id)
        ->where('edge_type', EdgeTypeEnum::History->value)
        ->first();

    expect($edge)->not->toBeNull();
    expect((float) $edge->weight_ratio)->toBe(0.7);
    expect($edge->computed_at)->not->toBeNull();
    expect($edge->vector_version)->toBe('v1');
});

it('builds a visited edge from an interaction log view after a recompute', function () {
    $client = ClientModel::factory()->create();
    $branch = BranchModel::factory()->create();
    ClientInteractionLogModel::create([
        'client_id' => $client->id,
        'interaction_type' => InteractionTypeEnum::View,
        'interactable_id' => $branch->id,
        'interactable_type' => 'branch',
    ]);

    $this->artisan('recommend:recompute-vectors', ['--client-id' => $client->id, '--force' => true])->assertExitCode(0);

    $edge = RecommendationEdgeModel::where('source_type', 'client')
        ->where('source_id', $client->id)
        ->where('target_type', 'branch')
        ->where('target_id', $branch->id)
        ->where('edge_type', EdgeTypeEnum::Visited->value)
        ->first();

    expect($edge)->not->toBeNull();
});

it('builds face_matched edges from the latest face analysis recommended catalog items after a recompute', function () {
    $client = ClientModel::factory()->create();
    $catalogItem = ServiceCatalogItemModel::factory()->create();
    $profile = ClientFaceProfileModel::create([
        'client_id' => $client->id,
        'image_path' => 'face-profiles/test.jpg',
        'image_hash' => 'hash',
        'is_primary' => true,
        'analysis_status' => FaceAnalysisStatusEnum::Completed,
        'uploaded_at' => now(),
    ]);
    ClientFaceAnalysisResultModel::create([
        'client_id' => $client->id,
        'face_profile_id' => $profile->id,
        'analysis_version' => 'v1',
        'analysis_source' => AnalysisSourceEnum::ThirdPartyApi,
        'detected_face_shape' => DetectedFaceShapeEnum::Oval,
        'confidence_ratio' => 0.9,
        'detected_features' => ['forehead_width' => 1, 'jaw_angle' => 1, 'cheekbone_prominence' => 'medium'],
        'recommended_catalog_item_ids' => ['ids' => [$catalogItem->id]],
        'computed_at' => now(),
    ]);

    $this->artisan('recommend:recompute-vectors', ['--client-id' => $client->id, '--force' => true])->assertExitCode(0);

    $edge = RecommendationEdgeModel::where('source_type', 'client')
        ->where('source_id', $client->id)
        ->where('target_type', 'catalog_item')
        ->where('target_id', $catalogItem->id)
        ->where('edge_type', EdgeTypeEnum::FaceMatched->value)
        ->first();

    expect($edge)->not->toBeNull();
});

it('registers the recompute command in the scheduler', function () {
    $schedule = app(Schedule::class);
    $events = collect($schedule->events())->map(fn ($event) => $event->command ?? '');

    expect($events->contains(fn ($command) => str_contains((string) $command, 'recommend:recompute-vectors')))->toBeTrue();
});
