<?php

declare(strict_types=1);

use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\ClientRecommendation\Enums\EdgeTypeEnum;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;

it('does not create a recommendation edge with a null target', function (): void {
    $booking = BookingModel::factory()->atHome()->create([
        'barber_id' => null,
        'booking_status' => BookingStatus::Confirmed,
    ]);
    $booking->update(['booking_status' => BookingStatus::Completed]);

    expect(RecommendationEdgeModel::query()
        ->where('source_id', $booking->client_id)
        ->where('edge_type', EdgeTypeEnum::History)
        ->whereNull('target_id')
        ->exists())->toBeFalse();
});
