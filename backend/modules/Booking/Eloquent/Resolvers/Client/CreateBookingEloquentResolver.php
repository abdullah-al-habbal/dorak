<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Client;

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Booking\CQRS\Command\Client\CreateBookingCommand;
use Modules\Booking\Eloquent\Resolvers\Shared\ActiveBookingBanException;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingOutsideScheduleException;
use Modules\Booking\Eloquent\Resolvers\Shared\ChairNotAvailableException;
use Modules\Booking\Eloquent\Resolvers\Shared\DoubleBookingException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Enums\BookingPaymentMethod;
use Modules\Booking\Enums\BookingPaymentStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
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

            if (! $chair->currentAvailability()->isBookable()) {
                throw new ChairNotAvailableException;
            }

            $assignedBarberId = $chair->getAttribute('barber_id');
            if (is_string($assignedBarberId) && $assignedBarberId !== $command->barberId) {
                $assignedBarber = BarberModel::query()->lockForUpdate()->findOrFail($assignedBarberId);

                if ($assignedBarber->isBanned()) {
                    throw new ActiveBookingBanException;
                }
            }

            $this->ensureNoOverlap('chair_id', $command->chairId, $command->timeSlot, $endsAt);
        }

        if ($command->barberId !== null) {
            $barber = BarberModel::query()->lockForUpdate()->findOrFail($command->barberId);

            if ($barber->isBanned()) {
                throw new ActiveBookingBanException;
            }

            $scheduleExists = BarberScheduleModel::query()
                ->where('barber_id', $command->barberId)
                ->exists();

            // An empty schedule remains backward compatible until Task 22's
            // product decision is made; configured schedules are enforced.
            if ($scheduleExists) {
                $slotStart = $command->timeSlot->format('H:i:s');
                $slotEnd = $endsAt->format('H:i:s');
                $insideSchedule = BarberScheduleModel::query()
                    ->where('barber_id', $command->barberId)
                    ->where('day_of_week', $command->timeSlot->dayOfWeek)
                    ->where('is_active', true)
                    ->where('start_time', '<=', $slotStart)
                    ->where('end_time', '>=', $slotEnd)
                    ->exists();

                if (! $insideSchedule) {
                    throw new BookingOutsideScheduleException;
                }
            }

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
