<?php

declare(strict_types=1);

namespace Modules\ClientRecommendation\Observers;

use Illuminate\Support\Facades\Log;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\ClientRecommendation\Enums\EdgeTypeEnum;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;
use Throwable;

final class BookingCompletedObserver
{
    public bool $afterCommit = true;

    public function updated(BookingModel $booking): void
    {
        if (! $booking->wasChanged('status')) {
            return;
        }

        if ($booking->status !== BookingStatus::Completed) {
            return;
        }

        try {
            $booking->loadMissing('chair');
            $targets = [];
            $barberId = $booking->barber_id ?? $booking->chair?->barber_id;

            if ($barberId !== null) {
                $targets[] = ['type' => 'barber', 'id' => $barberId];
            }

            if ($booking->chair?->branch_id !== null) {
                $targets[] = ['type' => 'branch', 'id' => $booking->chair->branch_id];
            }

            foreach ($targets as $target) {
                RecommendationEdgeModel::create([
                    'source_type' => 'client',
                    'source_id' => $booking->client_id,
                    'target_type' => $target['type'],
                    'target_id' => $target['id'],
                    'edge_type' => EdgeTypeEnum::History->value,
                    'weight_ratio' => 0.7,
                ]);
            }
        } catch (Throwable $exception) {
            Log::error('Failed to record completed booking recommendation history edges.', [
                'booking_id' => $booking->id,
                'exception' => $exception,
            ]);
        }
    }
}
