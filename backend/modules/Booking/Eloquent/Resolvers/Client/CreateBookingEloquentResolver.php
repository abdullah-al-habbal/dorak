<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Client;

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\CQRS\Command\Client\CreateBookingCommand;
use Modules\Booking\Eloquent\Resolvers\Shared\ChairNotAvailableException;
use Modules\Booking\Eloquent\Resolvers\Shared\DoubleBookingException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Enums\BookingPaymentMethod;
use Modules\Booking\Enums\BookingPaymentStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\OfferedService\Models\OfferedServiceModel;

final class CreateBookingEloquentResolver
{
    public function resolve(CreateBookingCommand $command): BookingModel
    {
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

            $totalDuration += $duration;
        }

        $endsAt = $command->timeSlot->copy()->addMinutes($totalDuration);

        if ($command->chairId !== null) {
            $chair = ChairModel::query()->lockForUpdate()->findOrFail($command->chairId);

            if ($chair->status === ChairStatus::Maintenance) {
                throw new ChairNotAvailableException;
            }

            $this->ensureNoOverlap('chair_id', $command->chairId, $command->timeSlot, $endsAt);
        }

        if ($command->barberId !== null) {
            BarberModel::query()->lockForUpdate()->findOrFail($command->barberId);
            $this->ensureNoOverlap('barber_id', $command->barberId, $command->timeSlot, $endsAt);
        }

        $bookingData = [
            'client_id' => $command->clientId,
            'barber_id' => $command->barberId,
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

    private function ensureNoOverlap(string $column, string $resourceId, Carbon $startsAt, Carbon $endsAt): void
    {
        $conflict = BookingModel::query()
            ->where($column, $resourceId)
            ->whereIn('status', BookingStatus::reservationBlockingValues())
            ->where('time_slot', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->lockForUpdate()
            ->exists();

        if ($conflict) {
            throw new DoubleBookingException;
        }
    }
}
