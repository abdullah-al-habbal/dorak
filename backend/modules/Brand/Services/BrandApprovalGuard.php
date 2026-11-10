<?php

declare(strict_types=1);

namespace Modules\Brand\Services;

use Modules\Branch\Models\BranchModel;
use Modules\Brand\Exceptions\BrandNotApprovedException;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\Support\DashboardActor;

/**
 * D11 (early access for a pending owner): until the platform approves the brand,
 * the owner may prepare the profile and one branch, but may not add stylists,
 * send invitations, add more branches or take bookings. The check is on the
 * server so no client can skip it; platform admins are not limited.
 */
final class BrandApprovalGuard
{
    public function ensureBranchBrandApproved(DashboardActor $actor, mixed $branchId): void
    {
        $this->ensureApproved($actor, BranchModel::query()->whereKey($branchId)->value('brand_id'));
    }

    public function ensureChairBrandApproved(DashboardActor $actor, mixed $chairId): void
    {
        if ($chairId === null) {
            return;
        }

        $this->ensureBranchBrandApproved($actor, ChairModel::query()->whereKey($chairId)->value('branch_id'));
    }

    /** A pending brand keeps its one prepared branch: a further branch needs approval first. */
    public function ensureCanAddBranch(DashboardActor $actor, mixed $brandId): void
    {
        $brand = BrandModel::query()->find($brandId);

        if ($brand instanceof BrandModel && ! $brand->isActive() && $brand->branches()->exists()) {
            $this->ensureApproved($actor, $brandId);
        }
    }

    public function ensureApproved(DashboardActor $actor, mixed $brandId): void
    {
        if ($actor->isPlatformAdmin() || $brandId === null) {
            return;
        }

        $brand = BrandModel::query()->find($brandId);

        if ($brand instanceof BrandModel && ! $brand->isActive()) {
            throw new BrandNotApprovedException;
        }
    }
}
