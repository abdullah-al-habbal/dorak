<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Dashboard\Support\DashboardActor;

/**
 * A barber reads only their own working hours and appointments; the queries are
 * additionally keyed by the actor id, so a barber id never comes from the request.
 */
final class BarberSchedulePolicy
{
    public function viewOwn(DashboardActor $actor): bool
    {
        return $actor->isBarber();
    }
}
