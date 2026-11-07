<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Schedule;

use Illuminate\Database\Eloquent\Collection;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Dashboard\Eloquent\Resolvers\Schedule\ListScheduleHoursEloquentResolver;

final readonly class ListScheduleHoursHandler
{
    public function __construct(private ListScheduleHoursEloquentResolver $resolver) {}

    /** @return Collection<int, BarberScheduleModel> */
    public function handle(string $barberId): Collection
    {
        return $this->resolver->resolve($barberId);
    }
}
