<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Client;

use Illuminate\Support\Facades\DB;
use Modules\Booking\CQRS\Command\Client\CancelBookingCommand;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\ValuesObjects\CancelBookingResult;

final class CancelBookingEloquentResolver
{
    public function resolve(CancelBookingCommand $command): CancelBookingResult
    {
        return DB::transaction(function () use ($command): CancelBookingResult {
            $booking = BookingModel::query()
                ->with(['chair.barber', 'barber', 'services'])
                ->lockForUpdate()
                ->findOrFail($command->bookingId);

            if ($booking->client_id !== $command->clientId) {
                return CancelBookingResult::notOwnBooking();
            }

            if (! $booking->status->canTransitionTo(BookingStatus::Canceled)) {
                return CancelBookingResult::invalidStatus();
            }

            if ($booking->time_slot->lessThanOrEqualTo(now()->addHours(2))) {
                return CancelBookingResult::tooLate();
            }

            $booking->update(['status' => BookingStatus::Canceled]);

            return CancelBookingResult::success($booking->fresh());
        });
    }
}
