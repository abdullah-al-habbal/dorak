<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Models\ChairModel;

final class BookingLifecycleEloquentResolver
{
    public function transitionForDashboard(string $bookingId, BookingStatus $target): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $target): BookingModel {
            $booking = BookingModel::query()->with('chair')->lockForUpdate()->findOrFail($bookingId);
            if (! $booking->status->canTransitionTo($target)) {
                throw new InvalidBookingTransitionException;
            }
            if ($target === BookingStatus::Confirmed) {
                $this->lockAssignedResources($booking);
                $this->ensureNoActiveOverlap($booking);
            }
            $booking->update(['status' => $target]);

            return $booking->fresh(['chair.barber', 'barber', 'services']);
        });
    }

    public function transitionForBarber(string $bookingId, string $barberId, BookingStatus $target): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $barberId, $target): BookingModel {
            $booking = BookingModel::query()
                ->with('chair')
                ->lockForUpdate()
                ->findOrFail($bookingId);

            $isAssigned = $booking->barber_id === $barberId
                || $booking->chair?->barber_id === $barberId;

            if (! $isAssigned) {
                throw new BookingNotAssignedException;
            }

            if (! $booking->status->canTransitionTo($target)) {
                throw new InvalidBookingTransitionException;
            }

            if ($target === BookingStatus::Confirmed) {
                $this->lockAssignedResources($booking);
                $this->ensureNoActiveOverlap($booking);
            }

            $booking->update(['status' => $target]);

            return $booking->fresh(['chair.barber', 'barber', 'services']);
        });
    }

    private function lockAssignedResources(BookingModel $booking): void
    {
        if ($booking->chair_id !== null) {
            ChairModel::query()->lockForUpdate()->findOrFail($booking->chair_id);
        }

        if ($booking->barber_id !== null) {
            BarberModel::query()->lockForUpdate()->findOrFail($booking->barber_id);
        }
    }

    private function ensureNoActiveOverlap(BookingModel $booking): void
    {
        foreach (['chair_id', 'barber_id'] as $column) {
            $resourceId = $booking->getAttribute($column);

            if ($resourceId === null) {
                continue;
            }

            $conflict = BookingModel::query()
                ->where($column, $resourceId)
                ->whereKeyNot($booking->getKey())
                ->whereIn('status', BookingStatus::availabilityBlockingValues())
                ->where('time_slot', '<', $booking->ends_at)
                ->where('ends_at', '>', $booking->time_slot)
                ->lockForUpdate()
                ->exists();

            if ($conflict) {
                throw new DoubleBookingException;
            }
        }
    }
}
