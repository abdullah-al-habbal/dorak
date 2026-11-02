<?php

declare(strict_types=1);

namespace Modules\Commission\Observers;

use Illuminate\Support\Facades\Log;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Commission\Services\CommissionRecorder;
use Throwable;

final class BookingCompletedCommissionObserver
{
    public bool $afterCommit = true;

    public function __construct(private readonly CommissionRecorder $recorder) {}

    public function updated(BookingModel $booking): void
    {
        if (! $booking->wasChanged('booking_status') || $booking->booking_status !== BookingStatus::Completed) {
            return;
        }

        try {
            $this->recorder->record($booking);
        } catch (Throwable $exception) {
            Log::error('Failed to record booking commission.', [
                'booking_id' => $booking->id,
                'exception' => $exception,
            ]);
        }
    }
}
