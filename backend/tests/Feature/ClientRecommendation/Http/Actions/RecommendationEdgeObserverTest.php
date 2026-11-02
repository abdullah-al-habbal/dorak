<?php

declare(strict_types=1);

use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientInteraction\Enums\FavoritedTypeEnum;
use Modules\ClientInteraction\Models\ClientFavoriteModel;
use Modules\ClientRecommendation\Enums\EdgeTypeEnum;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;

it('creates recommendation edge when favorite is added', function () {
    $client = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create();

    $this->actingAs($client, 'client')
        ->postJson('/api/v1/client/favorites', [
            'favorited_id' => $brand->id,
            'favorited_type' => FavoritedTypeEnum::Brand,
        ]);

    $edge = RecommendationEdgeModel::where('source_type', 'client')
        ->where('source_id', $client->id)
        ->where('target_type', 'brand')
        ->where('target_id', $brand->id)
        ->first();

    expect($edge)->not->toBeNull();
    expect($edge->edge_type)->toBe(EdgeTypeEnum::Favorite);
    expect($edge->weight_ratio)->toBe(1.0);
});

it('removes recommendation edge when favorite is removed', function () {
    $client = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create();

    $this->actingAs($client, 'client')
        ->postJson('/api/v1/client/favorites', [
            'favorited_id' => $brand->id,
            'favorited_type' => FavoritedTypeEnum::Brand,
        ]);

    $fav = ClientFavoriteModel::where('client_id', $client->id)->first();

    $this->actingAs($client, 'client')
        ->deleteJson("/api/v1/client/favorites/{$fav->id}");

    $edge = RecommendationEdgeModel::where('source_type', 'client')
        ->where('source_id', $client->id)
        ->where('edge_type', EdgeTypeEnum::Favorite->value)
        ->first();

    expect($edge)->toBeNull();
});

it('creates history edge on booking completion', function () {
    $booking = BookingModel::factory()->create();
    $booking->update(['booking_status' => BookingStatus::Completed]);

    $edge = RecommendationEdgeModel::where('source_type', 'client')
        ->where('source_id', $booking->client_id)
        ->where('target_type', 'barber')
        ->where('target_id', $booking->barber_id)
        ->where('edge_type', EdgeTypeEnum::History->value)
        ->first();

    expect($edge)->not->toBeNull();
    expect((float) $edge->weight_ratio)->toBe(0.7);
});

it('can run recompute command on client with signals', function () {
    $client = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create();

    $this->actingAs($client, 'client')
        ->postJson('/api/v1/client/favorites', [
            'favorited_id' => $brand->id,
            'favorited_type' => FavoritedTypeEnum::Brand,
        ]);

    $this->artisan('recommend:recompute-vectors', [
        '--client-id' => $client->id,
        '--force' => true,
    ])->assertExitCode(0);
});
