<?php

declare(strict_types=1);

namespace Modules\Booking\Services;

use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Events\BookingCancelledEvent;
use Modules\Booking\Events\BookingRescheduledEvent;
use Modules\Booking\Events\BookingStatusUpdatedEvent;
use Modules\Booking\Jobs\SendBookingStatusNotificationJob;
use Modules\Booking\Models\BookingModel;
use Modules\Review\Jobs\ReviewRequestNotification;

/**
 * Single dispatch point for the broadcast and push that follow a booking
 * change. Everything is deferred until the surrounding transaction commits, so
 * a rolled-back transition never notifies.
 */
final class BookingTransitionNotifier
{
    public function statusChanged(BookingModel $booking, bool $cancelled, bool $actorIsClient = false): void
    {
        $bookingId = (string) $booking->id;
        $branchId = (string) ($booking->branch_id ?? $booking->chair?->branch_id);
        $barberId = $booking->barber_id ?? $booking->chair?->barber_id;
        $clientId = (string) $booking->client_id;

        event($cancelled
            ? new BookingCancelledEvent($bookingId, $branchId, $barberId, $clientId)
            : new BookingStatusUpdatedEvent($bookingId, $branchId, $barberId, $booking->booking_status->value, $clientId));
        SendBookingStatusNotificationJob::dispatch($bookingId, false, app()->getLocale(), false, $actorIsClient)->afterCommit();

        if ($booking->booking_status === BookingStatus::Completed && ! $actorIsClient) {
            ReviewRequestNotification::dispatch($bookingId, app()->getLocale())->afterCommit();
        }
    }

    public function rescheduled(BookingModel $booking): void
    {
        $bookingId = (string) $booking->id;
        $barberId = $booking->barber_id ?? $booking->chair?->barber_id;

        event(new BookingRescheduledEvent($bookingId, (string) ($booking->branch_id ?? $booking->chair?->branch_id), $barberId, $booking->starts_at->toIso8601String(), (string) $booking->client_id));
        SendBookingStatusNotificationJob::dispatch($bookingId, false, app()->getLocale(), true)->afterCommit();
    }
}
