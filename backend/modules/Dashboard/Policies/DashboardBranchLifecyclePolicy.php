<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Dashboard\Support\DashboardActor;

/** D9: only a platform admin suspends or reactivates a branch; an owner of its brand (or the admin) switches it on or off. */
final class DashboardBranchLifecyclePolicy
{
    public function suspend(DashboardActor $actor): bool
    {
        return $actor->isPlatformAdmin();
    }

    public function switch(DashboardActor $actor, string $branchId): bool
    {
        return $actor->isPlatformAdmin() || ($actor->isBrandOwner() && $actor->canAccessBranch($branchId));
    }
}
