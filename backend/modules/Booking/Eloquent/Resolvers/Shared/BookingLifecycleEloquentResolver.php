<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\CQRS\Command\Client\CancelBookingCommand;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Booking\Services\BookingTransitionNotifier;
use Modules\Booking\ValuesObjects\CancelBookingResult;
use Modules\Chair\Models\ChairModel;

final class BookingLifecycleEloquentResolver
{
    public function __construct(
        private readonly BookingTransitionNotifier $notifier,
        private readonly StatusChangeLogger $statusChangeLogger,
    ) {}

    public function transitionForDashboard(string|int $bookingId, BookingStatus $target, string $actorType, string $actorId): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $target, $actorType, $actorId): BookingModel {
            $booking = BookingModel::query()->with('chair')->lockForUpdate()->findOrFail($bookingId);
            $fromStatus = $booking->status;
            if (! $booking->status->canTransitionTo($target)) {
                throw new InvalidBookingTransitionException;
            }
            if ($target === BookingStatus::Confirmed) {
                $this->lockAssignedResources($booking);
                $this->ensureNoActiveOverlap($booking);
            }
            $booking->update(['status' => $target]);
            $booking->refresh()->load(['chair.barber', 'barber', 'services']);
            $this->notifier->statusChanged($booking, $target === BookingStatus::Canceled);
            $this->logTransition($booking, $fromStatus, $target, StatusChangeActorTypeEnum::from($actorType), $actorId);

            return $booking;
        });
    }

    public function transitionForBranch(string|int $bookingId, string|int $branchId, BookingStatus $target): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $branchId, $target): BookingModel {
            $booking = BookingModel::query()->forBranch($branchId)
                ->with('chair')->lockForUpdate()->findOrFail($bookingId);
            $fromStatus = $booking->status;
            if (! in_array($target, [BookingStatus::Confirmed, BookingStatus::InProgress, BookingStatus::Completed, BookingStatus::NoShow, BookingStatus::Canceled], true)
                || ! $booking->status->canTransitionTo($target)) {
                throw new InvalidBookingTransitionException;
            }
            if ($target === BookingStatus::Confirmed) {
                $this->lockAssignedResources($booking);
                $this->ensureNoActiveOverlap($booking);
            }
            $booking->update(['status' => $target]);
            $booking->refresh()->load(['chair.barber', 'barber', 'services']);
            $this->notifier->statusChanged($booking, $target === BookingStatus::Canceled);
            $this->logTransition($booking, $fromStatus, $target, StatusChangeActorTypeEnum::Branch, (string) $branchId);

            return $booking;
        });
    }

    public function cancelForClient(CancelBookingCommand $command): CancelBookingResult
    {
        return DB::transaction(function () use ($command): CancelBookingResult {
            $booking = BookingModel::query()->with(['chair.barber', 'barber', 'services'])->lockForUpdate()->findOrFail($command->bookingId);
            $fromStatus = $booking->status;
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
            $booking->refresh();
            $this->notifier->statusChanged($booking, true, actorIsClient: true);
            $this->logTransition($booking, $fromStatus, BookingStatus::Canceled, StatusChangeActorTypeEnum::Client, $command->clientId);

            return CancelBookingResult::success($booking);
        });
    }

    public function cancelForBarber(string|int $bookingId, string|int $barberId, string $reason): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $barberId, $reason): BookingModel {
            $booking = BookingModel::query()->with('chair')->lockForUpdate()->findOrFail($bookingId);
            $fromStatus = $booking->status;
            if ($booking->barber_id !== $barberId && $booking->chair?->barber_id !== $barberId) {
                throw new BookingNotAssignedException;
            }
            if (! $booking->status->canTransitionTo(BookingStatus::Canceled)) {
                throw new InvalidBookingTransitionException;
            }
            if ($booking->time_slot->lessThanOrEqualTo(now()->addHours(2))) {
                throw new BookingCancellationTooLateException;
            }
            $booking->update(['status' => BookingStatus::Canceled, 'cancellation_reason' => $reason]);
            $booking->refresh()->load('chair');
            $this->notifier->statusChanged($booking, true);
            $this->logTransition($booking, $fromStatus, BookingStatus::Canceled, StatusChangeActorTypeEnum::Barber, (string) $barberId, $reason);

            return $booking;
        });
    }

    public function cancelForChairMaintenance(string|int $bookingId): BookingModel
    {
        return DB::transaction(function () use ($bookingId): BookingModel {
            $booking = BookingModel::query()->lockForUpdate()->findOrFail($bookingId);
            $fromStatus = $booking->status;
            if (! $booking->status->canTransitionTo(BookingStatus::Canceled)) {
                throw new InvalidBookingTransitionException;
            }
            $booking->update([
                'status' => BookingStatus::Canceled,
                'cancellation_reason' => BookingModel::CANCELLATION_REASON_CHAIR_MAINTENANCE,
            ]);
            $booking->refresh();
            $this->notifier->statusChanged($booking, true);
            $this->logTransition($booking, $fromStatus, BookingStatus::Canceled, StatusChangeActorTypeEnum::System, null, BookingModel::CANCELLATION_REASON_CHAIR_MAINTENANCE);

            return $booking;
        });
    }

    public function transitionForBarber(string|int $bookingId, string|int $barberId, BookingStatus $target): BookingModel
    {
        return DB::transaction(function () use ($bookingId, $barberId, $target): BookingModel {
            $booking = BookingModel::query()
                ->with('chair')
                ->lockForUpdate()
                ->findOrFail($bookingId);

            $fromStatus = $booking->status;
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
            $booking->refresh()->load(['chair.barber', 'barber', 'services']);
            $this->notifier->statusChanged($booking, $target === BookingStatus::Canceled);
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

            $query = BookingModel::query()
                ->where($column, $resourceId)
                ->whereKeyNot($booking->getKey());
            BookingAvailability::apply($query, $booking->time_slot, $booking->ends_at);
            $conflict = $query->lockForUpdate()->exists();

            if ($conflict) {
                throw new DoubleBookingException;
            }
        }
    }
}
