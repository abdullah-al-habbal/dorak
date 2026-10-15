<?php

declare(strict_types=1);

namespace Modules\Booking\Queries;

use Carbon\Carbon;
use Modules\Barber\Models\BarberScheduleModel;

final class BarberScheduleAvailability
{
    public static function covers(?string $barberId, Carbon $startsAt, Carbon $endsAt): bool
    {
        if ($barberId === null) {
            return true;
        }

        $hasSchedule = BarberScheduleModel::query()
            ->where('barber_id', $barberId)
            ->exists();

        // An empty schedule remains backward compatible until Task 22's product
        // decision is made; configured schedules are enforced.
        if (! $hasSchedule) {
            return true;
        }

        return BarberScheduleModel::query()
            ->where('barber_id', $barberId)
            ->where('day_of_week', $startsAt->dayOfWeek)
            ->where('is_active', true)
            ->where('start_time', '<=', $startsAt->format('H:i:s'))
            ->where('end_time', '>=', $endsAt->format('H:i:s'))
            ->exists();
    }
}
