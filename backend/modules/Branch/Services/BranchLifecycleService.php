<?php

declare(strict_types=1);

namespace Modules\Branch\Services;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Exceptions\BranchLifecycleException;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandApprovalGuard;
use Modules\Brand\Services\BrandFeatures;
use Modules\Dashboard\Support\DashboardActor;

/**
 * D9: the brand approval and the plan limit are the gate. The owner switches a branch on or off;
 * only a platform admin suspends and reactivates it. Every move locks the branch and its brand.
 */
final class BranchLifecycleService
{
    public function __construct(
        private readonly BrandApprovalGuard $approvals,
        private readonly BrandFeatures $features,
        private readonly StatusChangeLogger $logger,
    ) {}

    public function switchOn(DashboardActor $actor, string $branchId): BranchModel
    {
        return DB::transaction(function () use ($actor, $branchId): BranchModel {
            $branch = $this->lock($branchId);
            $this->approvals->ensureApproved($actor, $branch->getAttribute('brand_id'));
            if ($branch->status === BranchStatusEnum::Suspended) {
                throw BranchLifecycleException::suspended();
            }
            if ($branch->status === BranchStatusEnum::Enabled) {
                return $branch;
            }

            $this->features->ensureBranchManageable($branchId);
            $this->change($branch, BranchStatusEnum::Enabled, $actor, null);

            return $branch;
        });
    }

    public function switchOff(DashboardActor $actor, string $branchId): BranchModel
    {
        return DB::transaction(function () use ($actor, $branchId): BranchModel {
            $branch = $this->lock($branchId);
            if ($branch->status === BranchStatusEnum::Suspended) {
                throw BranchLifecycleException::suspended();
            }
            if ($branch->status !== BranchStatusEnum::Enabled) {
                return $branch;
            }

            $enabled = BranchModel::query()->where('brand_id', $branch->getAttribute('brand_id'))->where('status', BranchStatusEnum::Enabled->value)->lockForUpdate()->count();
            if ($enabled <= 1) {
                throw BranchLifecycleException::lastActive();
            }

            $this->change($branch, BranchStatusEnum::Disabled, $actor, null);

            return $branch;
        });
    }

    public function suspend(DashboardActor $actor, string $branchId, string $reason): BranchModel
    {
        return DB::transaction(function () use ($actor, $branchId, $reason): BranchModel {
            $branch = $this->lock($branchId);
            if ($branch->status === BranchStatusEnum::Suspended) {
                throw BranchLifecycleException::alreadySuspended();
            }

            $this->change($branch, BranchStatusEnum::Suspended, $actor, $reason);

            return $branch;
        });
    }

    /** A reactivated branch comes back switched off; its owner decides when it goes live again. */
    public function reactivate(DashboardActor $actor, string $branchId): BranchModel
    {
        return DB::transaction(function () use ($actor, $branchId): BranchModel {
            $branch = $this->lock($branchId);
            if ($branch->status !== BranchStatusEnum::Suspended) {
                throw BranchLifecycleException::notSuspended();
            }

            $this->change($branch, BranchStatusEnum::Disabled, $actor, null);

            return $branch;
        });
    }

    private function change(BranchModel $branch, BranchStatusEnum $to, DashboardActor $actor, ?string $reason): void
    {
        $from = $branch->status;
        $branch->forceFill(['status' => $to])->save();
        $this->logger->log(
            StatusChangeSubjectTypeEnum::Branch,
            (string) $branch->getKey(),
            $from->value,
            $to->value,
            $actor->isPlatformAdmin() ? StatusChangeActorTypeEnum::Admin : StatusChangeActorTypeEnum::Owner,
            $actor->id,
            $reason,
        );
    }

    private function lock(string $branchId): BranchModel
    {
        $branch = BranchModel::query()->whereKey($branchId)->lockForUpdate()->firstOrFail();
        BrandModel::query()->whereKey($branch->getAttribute('brand_id'))->lockForUpdate()->first();

        return $branch;
    }
}
