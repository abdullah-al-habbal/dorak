<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Support\DashboardActor;

/**
 * Who may create, change and delete a branch from the dashboard: the platform
 * admin, the brand owner of the branch's brand, and (for changes that keep the
 * branch in its brand) the manager of that branch. Registered by ability name
 * (`dashboard.branch.*`) because the model-level `BranchPolicy` serves other APIs.
 */
final class DashboardBranchPolicy
{
    public function create(DashboardActor $actor, string $brandId): bool
    {
        return $actor->canManageBrand($brandId);
    }

    public function delete(DashboardActor $actor, BranchModel $branch): bool
    {
        return $actor->canManageBrand($branch->getAttribute('brand_id'));
    }

    /** A manager cannot move their branch to another brand; an owner only between brands they own. */
    public function update(DashboardActor $actor, BranchModel $branch, mixed $targetBrandId): bool
    {
        if ($actor->isPlatformAdmin()) {
            return true;
        }

        if (! $actor->canAccessBranch($branch->getKey())) {
            return false;
        }

        return $actor->isBrandOwner()
            ? $actor->canManageBrand($targetBrandId)
            : (string) $branch->getAttribute('brand_id') === (string) $targetBrandId;
    }

    public function updateHours(DashboardActor $actor, BranchModel $branch): bool
    {
        return $actor->isPlatformAdmin() || $actor->canAccessBranch($branch->getKey());
    }
}
