<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Bookings;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairHasActiveBookingsException;

final class RescheduleBookingEloquentResolver
{
    public function resolve(string $bookingId, Carbon $timeSlot, Carbon $endsAt): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $timeSlot, $endsAt): BookingModel {
            $booking = BookingModel::query()->lockForUpdate()->findOrFail($bookingId);
            if ($booking->chair_id !== null) {
                ChairModel::query()->lockForUpdate()->findOrFail($booking->chair_id);
            }
            if ($booking->barber_id !== null) {
                BarberModel::query()->lockForUpdate()->findOrFail($booking->barber_id);
            }
            foreach (['chair_id', 'barber_id'] as $column) {
                $resourceId = $booking->getAttribute($column);
                if ($resourceId === null) {
                    continue;
                }
                $collision = BookingModel::query()->where($column, $resourceId)->whereKeyNot($booking->id)->whereIn('status', BookingStatus::reservationBlockingValues())->where('time_slot', '<', $endsAt)->where('ends_at', '>', $timeSlot)->lockForUpdate()->exists();
                if ($collision) {
                    throw new ChairHasActiveBookingsException('The selected time overlaps an active booking.');
                }
            }
            $booking->update(['time_slot' => $timeSlot, 'ends_at' => $endsAt]);

            return $booking->fresh(['chair', 'barber', 'client', 'services']);
        });
    }
}
