<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Schedule;

use Illuminate\Database\Eloquent\Collection;
use Modules\Barber\Models\BarberScheduleModel;

final class ListScheduleHoursEloquentResolver
{
    /** @return Collection<int, BarberScheduleModel> */
    public function resolve(string $barberId): Collection
    {
        return BarberScheduleModel::query()
            ->where('barber_id', $barberId)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }
}
