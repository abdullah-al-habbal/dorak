<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Client;

use Carbon\Carbon;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\CQRS\Command\Client\CreateBookingCommand;
use Modules\Booking\Eloquent\Resolvers\Shared\ActiveBookingBanException;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingOutsideScheduleException;
use Modules\Booking\Eloquent\Resolvers\Shared\ChairNotAvailableException;
use Modules\Booking\Eloquent\Resolvers\Shared\DoubleBookingException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Eloquent\Resolvers\Shared\NonDiscoverableBookingEntityException;
use Modules\Booking\Enums\BookingPaymentMethod;
use Modules\Booking\Enums\BookingPaymentStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\Queries\BarberScheduleAvailability;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Models\OfferedServiceModel;

final class CreateBookingEloquentResolver
{
    public function resolve(CreateBookingCommand $command): BookingModel
    {
        $client = ClientModel::query()->lockForUpdate()->findOrFail($command->clientId);

        if ($client->isBanned()) {
            throw new ActiveBookingBanException;
        }

        $chair = $command->chairId !== null
            ? ChairModel::query()->lockForUpdate()->findOrFail($command->chairId)
            : null;

        $chairBarberId = $chair?->getAttribute('barber_id');
        $chairBarberId = is_string($chairBarberId) ? $chairBarberId : null;

        if ($chairBarberId !== null && $command->barberId !== null && $command->barberId !== $chairBarberId) {
            throw new InvalidBookingServicesException('booking::messages.barber_chair_mismatch');
        }

        $barberId = $command->barberId ?? $chairBarberId;

        $services = OfferedServiceModel::query()
            ->whereIn('id', $command->serviceIds)
            ->where('active', true)
            ->lockForUpdate()
            ->get();

        if ($services->count() !== count($command->serviceIds)) {
            throw new InvalidBookingServicesException;
        }

        $totalDuration = 0;

        foreach ($services as $service) {
            $duration = $service->getAttribute('duration');

            if (! is_int($duration) || $duration < 1) {
                throw new InvalidBookingServicesException;
            }

            if (! $this->isOwnedByBookingScope($service, $chair, $barberId)) {
                throw new InvalidBookingServicesException;
            }

            $totalDuration += $duration;
        }

        $endsAt = $command->timeSlot->copy()->addMinutes($totalDuration);

        if ($chair !== null) {
            if (! BranchModel::query()->discoverable()->whereKey($chair->getAttribute('branch_id'))->exists()) {
                throw new NonDiscoverableBookingEntityException;
            }

            if (! $chair->currentAvailability()->isBookable()) {
                throw new ChairNotAvailableException;
            }

            $this->ensureNoOverlap('chair_id', $command->chairId, $command->timeSlot, $endsAt);
        }

        if ($barberId !== null) {
            $barber = BarberModel::query()->lockForUpdate()->findOrFail($barberId);

            if ($barber->isBanned()) {
                throw new ActiveBookingBanException;
            }
            if ($barber->getAttribute('status') !== BarberStatusEnum::Enabled) {
                throw new NonDiscoverableBookingEntityException;
            }

            if (! BarberScheduleAvailability::covers($barberId, $command->timeSlot, $endsAt)) {
                throw new BookingOutsideScheduleException;
            }

            $this->ensureNoOverlap('barber_id', $barberId, $command->timeSlot, $endsAt);
        }

        $bookingData = [
            'client_id' => $command->clientId,
            'barber_id' => $barberId,
            'time_slot' => $command->timeSlot,
            'ends_at' => $endsAt,
            'status' => BookingStatus::Pending,
            'payment_method' => BookingPaymentMethod::PayAtSalon,
            'payment_status' => BookingPaymentStatus::UnpaidInPerson,
        ];

        if ($command->chairId !== null) {
            $bookingData['chair_id'] = $command->chairId;
        }

        if ($command->atHomeLocation !== null) {
            $bookingData['at_home_location'] = $command->atHomeLocation;
        }

        $booking = BookingModel::create($bookingData);

        $booking->services()->attach($command->serviceIds);

        $booking->load(['chair.barber', 'barber', 'services']);

        return $booking;
    }

    private function isOwnedByBookingScope(OfferedServiceModel $service, ?ChairModel $chair, ?string $barberId): bool
    {
        $ownerId = $service->getAttribute('serviceable_id');

        return match ($service->getAttribute('serviceable_type')) {
            'barber' => $barberId !== null && $ownerId === $barberId,
            'branch' => $chair !== null && $ownerId === $chair->getAttribute('branch_id'),
            'brand' => $chair !== null && $ownerId === $chair->branch()->value('brand_id'),
            default => false,
        };
    }

    private function ensureNoOverlap(string $column, string $resourceId, Carbon $startsAt, Carbon $endsAt): void
    {
        $query = BookingModel::query()->where($column, $resourceId);
        BookingAvailability::apply($query, $startsAt, $endsAt);
        $conflict = $query->lockForUpdate()->exists();

        if ($conflict) {
            throw new DoubleBookingException;
        }
    }
}
