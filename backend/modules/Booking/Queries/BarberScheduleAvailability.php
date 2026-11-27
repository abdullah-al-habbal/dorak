<?php

declare(strict_types=1);

namespace Modules\Booking\Queries;

use Carbon\Carbon;
use Modules\Barber\Models\BarberScheduleModel;

final class BarberScheduleAvailability
{
    /** Schedule times are wall-clock times in `$timeZone`, the zone of the branch the booking is at. */
    public static function covers(?string $barberId, Carbon $startsAt, Carbon $endsAt, string $timeZone): bool
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

        $startsAt = $startsAt->copy()->setTimezone($timeZone);
        $endsAt = $endsAt->copy()->setTimezone($timeZone);

        // A schedule is one stretch of a day, so a booking that runs into the next day is outside it. Without
        // this, an end of 00:00 compares as earlier than any closing time.
        if (! $startsAt->isSameDay($endsAt)) {
            return false;
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
