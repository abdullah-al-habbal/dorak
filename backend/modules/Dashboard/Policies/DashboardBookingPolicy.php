<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Booking\Models\BookingModel;
use Modules\Dashboard\Support\DashboardActor;

/** A booking, or a walk-in, can be written only inside a branch the actor may access. */
final class DashboardBookingPolicy
{
    public function manage(DashboardActor $actor, BookingModel $booking): bool
    {
        return $actor->canAccessBranch($booking->branch_id);
    }

    public function createWalkIn(DashboardActor $actor, string $branchId): bool
    {
        return $actor->canAccessBranch($branchId);
    }
}
