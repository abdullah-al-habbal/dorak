<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Bookings;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingOutsideScheduleException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingTransitionException;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\Queries\BarberScheduleAvailability;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Booking\Services\BookingLockOrder;
use Modules\Booking\Services\BookingTransitionNotifier;
use Modules\Branch\Services\BranchHours;
use Modules\Branch\Services\BranchTimeZones;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairHasActiveBookingsException;

final class RescheduleBookingEloquentResolver
{
    public function __construct(
        private readonly BookingTransitionNotifier $notifier,
        private readonly BranchHours $branchHours,
        private readonly BranchTimeZones $zones,
        private readonly BookingLockOrder $lockOrder,
    ) {}

    public function resolve(string|int $bookingId, Carbon $startsAt, Carbon $endsAt): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $startsAt, $endsAt): BookingModel {
            // Lock order matches CreateBookingEloquentResolver: chair, then barber, then the booking rows. Locking the
            // booking first deadlocked with a create that held the chair and was scanning this booking's slot.
            $booking = $this->lockOrder->lockBooking($bookingId);
            if (! in_array($booking->booking_status, [BookingStatus::Pending, BookingStatus::Confirmed], true)) {
                throw new InvalidBookingTransitionException;
            }
            if (! $this->branchHours->covers($booking->branch_id, $startsAt, $endsAt)) {
                throw new BookingOutsideScheduleException;
            }
            if ($booking->barber_id !== null && ! BarberScheduleAvailability::covers($booking->barber_id, $startsAt, $endsAt, $this->zones->for($booking->branch_id))) {
                throw new BookingOutsideScheduleException;
            }
            foreach (['chair_id', 'barber_id'] as $column) {
                $resourceId = $booking->getAttribute($column);
                if ($resourceId === null) {
                    continue;
                }
                $query = BookingModel::query()->where($column, $resourceId)->whereKeyNot($booking->id);
                BookingAvailability::apply($query, $startsAt, $endsAt);
                $collision = $query->lockForUpdate()->exists();
                if ($collision) {
                    throw new ChairHasActiveBookingsException(__('dashboard::messages.booking_time_overlap'));
                }
            }
            $booking->update(['starts_at' => $startsAt, 'ends_at' => $endsAt]);

            $booking->refresh()->load(['chair', 'barber', 'client' => fn ($query) => $query->withReputation(), 'services']);
            $this->notifier->rescheduled($booking);

            return $booking;
        });
    }
}
