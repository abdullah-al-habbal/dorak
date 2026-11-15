<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Support\DashboardActor;

/**
 * Who may run a branch's staffing (barber affiliations and the job board): the platform admin, a manager
 * of that branch or an owner of its brand (decided 2026-11-13). Barbers never may.
 */
final class DashboardStaffingPolicy
{
    public function manage(DashboardActor $actor, BranchModel $branch): bool
    {
        return $actor->canManageStaffing() && $actor->canAccessBranch($branch->getKey());
    }
}
