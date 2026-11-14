<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Dashboard\Support\DashboardActor;

/** A walk-in booking can be created only inside a branch the actor may access. */
final class DashboardBookingPolicy
{
    public function createWalkIn(DashboardActor $actor, string $branchId): bool
    {
        return $actor->canAccessBranch($branchId);
    }
}
