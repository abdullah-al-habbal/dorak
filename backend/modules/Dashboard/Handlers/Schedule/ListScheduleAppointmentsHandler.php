<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Schedule;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Dashboard\CQRS\Query\ListScheduleAppointmentsQuery;
use Modules\Dashboard\Eloquent\Resolvers\Schedule\ListScheduleAppointmentsEloquentResolver;

final readonly class ListScheduleAppointmentsHandler
{
    public function __construct(private ListScheduleAppointmentsEloquentResolver $resolver) {}

    public function handle(ListScheduleAppointmentsQuery $query): LengthAwarePaginator
    {
        return $this->resolver->resolve($query);
    }
}
