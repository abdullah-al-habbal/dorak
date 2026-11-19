<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

use Closure;
use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\Booking\Constants\BookingConstants;
use Modules\Booking\CQRS\Command\Client\CancelBookingCommand;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Booking\Services\BookingLockOrder;
use Modules\Booking\Services\BookingTransitionNotifier;
use Modules\Booking\ValuesObjects\CancelBookingResult;

final class BookingLifecycleEloquentResolver
{
    public function __construct(
        private readonly BookingTransitionNotifier $notifier,
        private readonly StatusChangeLogger $statusChangeLogger,
        private readonly BookingLockOrder $lockOrder,
    ) {}

    public function transitionForDashboard(string|int $bookingId, BookingStatus $target, StatusChangeActorTypeEnum $actorType, string $actorId): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $target, $actorType, $actorId): BookingModel {
            $booking = $this->lockForTarget($bookingId, $target);
            $fromStatus = $booking->booking_status;
            if (! $booking->booking_status->canTransitionTo($target)) {
                throw new InvalidBookingTransitionException;
            }
            if ($target === BookingStatus::Confirmed) {
                $this->ensureNoActiveOverlap($booking);
            }
            $booking->update(['booking_status' => $target]);
            $booking->refresh()->load(['chair.barber', 'barber', 'services']);
            $this->notifier->statusChanged($booking, $target === BookingStatus::Cancelled);
            $this->logTransition($booking, $fromStatus, $target, $actorType, $actorId);

            return $booking;
        });
    }

    public function transitionForBranch(string|int $bookingId, string|int $branchId, BookingStatus $target): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $branchId, $target): BookingModel {
            $booking = $this->lockForTarget($bookingId, $target, fn ($query) => $query->forBranch($branchId));
            $fromStatus = $booking->booking_status;
            if (! in_array($target, [BookingStatus::Confirmed, BookingStatus::InProgress, BookingStatus::Completed, BookingStatus::NoShow, BookingStatus::Cancelled], true)
                || ! $booking->booking_status->canTransitionTo($target)) {
                throw new InvalidBookingTransitionException;
            }
            if ($target === BookingStatus::Confirmed) {
                $this->ensureNoActiveOverlap($booking);
            }
            $booking->update(['booking_status' => $target]);
            $booking->refresh()->load(['chair.barber', 'barber', 'services']);
            $this->notifier->statusChanged($booking, $target === BookingStatus::Cancelled);
            $this->logTransition($booking, $fromStatus, $target, StatusChangeActorTypeEnum::Branch, (string) $branchId);

            return $booking;
        });
    }

    public function cancelForClient(CancelBookingCommand $command): CancelBookingResult
    {
        return DB::transaction(function () use ($command): CancelBookingResult {
            $booking = BookingModel::query()->with(['chair.barber', 'barber', 'services'])->lockForUpdate()->findOrFail($command->bookingId);
            $fromStatus = $booking->booking_status;
            if ($booking->client_id !== $command->clientId) {
                return CancelBookingResult::notOwnBooking();
            }
            if (! $booking->booking_status->canTransitionTo(BookingStatus::Cancelled)) {
                return CancelBookingResult::invalidStatus();
            }
            if ($booking->starts_at->lessThanOrEqualTo(now()->addHours(2))) {
                return CancelBookingResult::tooLate();
            }
            $booking->update(['booking_status' => BookingStatus::Cancelled]);
            $booking->refresh();
            $this->notifier->statusChanged($booking, true, actorIsClient: true);
            $this->logTransition($booking, $fromStatus, BookingStatus::Cancelled, StatusChangeActorTypeEnum::Client, $command->clientId);

            return CancelBookingResult::success($booking);
        });
    }

    public function cancelForBarber(string|int $bookingId, string|int $barberId, string $reason): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $barberId, $reason): BookingModel {
            $booking = BookingModel::query()->with('chair')->lockForUpdate()->findOrFail($bookingId);
            $fromStatus = $booking->booking_status;
            if ($booking->barber_id !== $barberId && $booking->chair?->barber_id !== $barberId) {
                throw new BookingNotAssignedException;
            }
            if (! $booking->booking_status->canTransitionTo(BookingStatus::Cancelled)) {
                throw new InvalidBookingTransitionException;
            }
            if ($booking->starts_at->lessThanOrEqualTo(now()->addHours(2))) {
                throw new BookingCancellationTooLateException;
            }
            $booking->update(['booking_status' => BookingStatus::Cancelled, 'cancellation_reason' => $reason]);
            $booking->refresh()->load('chair');
            $this->notifier->statusChanged($booking, true);
            $this->logTransition($booking, $fromStatus, BookingStatus::Cancelled, StatusChangeActorTypeEnum::Barber, (string) $barberId, $reason);

            return $booking;
        });
    }

    public function cancelForChairMaintenance(string|int $bookingId): BookingModel
    {
        return DB::transaction(function () use ($bookingId): BookingModel {
            $booking = BookingModel::query()->lockForUpdate()->findOrFail($bookingId);
            $fromStatus = $booking->booking_status;
            if (! $booking->booking_status->canTransitionTo(BookingStatus::Cancelled)) {
                throw new InvalidBookingTransitionException;
            }
            $booking->update([
                'booking_status' => BookingStatus::Cancelled,
                'cancellation_reason' => BookingConstants::BOOKING_CANCELLATION_REASON_CHAIR_MAINTENANCE,
            ]);
            $booking->refresh();
            $this->notifier->statusChanged($booking, true);
            $this->logTransition($booking, $fromStatus, BookingStatus::Cancelled, StatusChangeActorTypeEnum::System, null, BookingConstants::BOOKING_CANCELLATION_REASON_CHAIR_MAINTENANCE);

            return $booking;
        });
    }

    public function transitionForBarber(string|int $bookingId, string|int $barberId, BookingStatus $target): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $barberId, $target): BookingModel {
            $booking = $this->lockForTarget($bookingId, $target);

            $fromStatus = $booking->booking_status;
            $isAssigned = $booking->barber_id === $barberId
                || $booking->chair?->barber_id === $barberId;

            if (! $isAssigned) {
                throw new BookingNotAssignedException;
            }

            if (! $booking->booking_status->canTransitionTo($target)) {
                throw new InvalidBookingTransitionException;
            }

            if ($target === BookingStatus::Confirmed) {
                $this->ensureNoActiveOverlap($booking);
            }

            $booking->update(['booking_status' => $target]);
            $booking->refresh()->load(['chair.barber', 'barber', 'services']);
            $this->notifier->statusChanged($booking, $target === BookingStatus::Cancelled);
            $this->logTransition($booking, $fromStatus, $target, StatusChangeActorTypeEnum::Barber, (string) $barberId);

            return $booking;
        });
    }

    private function logTransition(BookingModel $booking, BookingStatus $fromStatus, BookingStatus $toStatus, StatusChangeActorTypeEnum $actorType, ?string $actorId, ?string $reason = null): void
    {
        $this->statusChangeLogger->log(
            StatusChangeSubjectTypeEnum::Booking,
            (string) $booking->id,
            $fromStatus->value,
            $toStatus->value,
            $actorType,
            $actorId,
            $reason,
        );
    }

    /**
     * Confirming re-checks overlaps, so it must take its locks in create's order (chair, barber, booking).
     * Every other transition touches the booking row only and cannot invert against a create.
     */
    private function lockForTarget(string|int $bookingId, BookingStatus $target, ?Closure $scope = null): BookingModel
    {
        if ($target === BookingStatus::Confirmed) {
            return $this->lockOrder->lockBooking($bookingId, $scope, ['chair']);
        }

        $query = BookingModel::query();
        if ($scope !== null) {
            $scope($query);
        }

        return $query->with('chair')->lockForUpdate()->findOrFail($bookingId);
    }

    private function ensureNoActiveOverlap(BookingModel $booking): void
    {
        foreach (['chair_id', 'barber_id'] as $column) {
            $resourceId = $booking->getAttribute($column);

            if ($resourceId === null) {
                continue;
            }

            $query = BookingModel::query()
                ->where($column, $resourceId)
                ->whereKeyNot($booking->getKey());
            BookingAvailability::apply($query, $booking->starts_at, $booking->ends_at);
            $conflict = $query->lockForUpdate()->exists();

            if ($conflict) {
                throw new DoubleBookingException;
            }
        }
    }
}
