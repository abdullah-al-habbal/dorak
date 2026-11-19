<?php

declare(strict_types=1);

namespace Modules\Booking\Services;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingTransitionException;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Models\ChairModel;

/**
 * The one place that fixes the order in which a booking write takes its row locks:
 * client, chair, barber, then the booking rows. Create, reschedule and confirm must all
 * follow it; a path that locks the booking first deadlocks against a create that holds
 * the chair and scans into that booking's slot.
 */
final class BookingLockOrder
{
    /**
     * Reads the booking's chair and barber, locks them, then locks the booking itself and
     * checks that neither was reassigned in between.
     *
     * @param  Closure(Builder<BookingModel>): mixed|null  $scope  narrows both reads, for example to one branch
     * @param  list<string>  $with  relations to load on the locked booking
     */
    public function lockBooking(string|int $bookingId, ?Closure $scope = null, array $with = []): BookingModel
    {
        $unlocked = $this->query($scope)->findOrFail($bookingId);
        $chairId = $unlocked->chair_id;
        $barberId = $unlocked->barber_id;

        $this->lockResources($chairId, $barberId);

        $booking = $this->query($scope)->with($with)->lockForUpdate()->findOrFail($bookingId);
        if ($booking->chair_id !== $chairId || $booking->barber_id !== $barberId) {
            throw new InvalidBookingTransitionException;
        }

        return $booking;
    }

    public function lockResources(string|int|null $chairId, string|int|null $barberId): void
    {
        if ($chairId !== null) {
            ChairModel::query()->lockForUpdate()->findOrFail($chairId);
        }
        if ($barberId !== null) {
            BarberModel::query()->lockForUpdate()->findOrFail($barberId);
        }
    }

    /** @return Builder<BookingModel> */
    private function query(?Closure $scope): Builder
    {
        $query = BookingModel::query();
        if ($scope !== null) {
            $scope($query);
        }

        return $query;
    }
}
