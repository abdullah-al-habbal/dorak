<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\Support\DashboardActor;

/**
 * Who may manage a branch's chairs from the dashboard: the platform admin, the
 * brand owner of the chair's brand, or the manager of the chair's branch. The
 * model-level `ChairPolicy` serves the branch and admin APIs, so these abilities
 * are registered by name (`dashboard.chair.*`) instead of by model.
 */
final class DashboardChairPolicy
{
    public function create(DashboardActor $actor, string $branchId): bool
    {
        return $actor->canAccessBranch($branchId);
    }

    public function manage(DashboardActor $actor, ChairModel $chair): bool
    {
        return $actor->canAccessBranch($chair->getAttribute('branch_id'));
    }
}
