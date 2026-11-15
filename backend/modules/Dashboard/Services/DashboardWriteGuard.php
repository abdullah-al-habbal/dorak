<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Exceptions\BranchReadOnlyException;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Exceptions\BrandSuspendedException;
use Modules\Brand\Services\BrandApprovalGuard;
use Modules\Dashboard\Support\DashboardActor;

/**
 * The one place that decides whether an operational dashboard write is allowed for the state of the
 * brand and branch it touches (F-01, decision A). A Suspended brand or branch is read-only. Pending and
 * Disabled branches stay writable because owners prepare them that way (D9, point 1 of the resolved
 * answers). The platform admin bypasses every check. Self-account writes never call this guard, and
 * booking cancellation skips it on purpose (point 2). Call it before the first write, inside the
 * transaction when the write must roll back with it.
 */
final readonly class DashboardWriteGuard
{
    public function __construct(private BrandApprovalGuard $brands) {}

    /** @throws BrandSuspendedException */
    public function ensureBrandWritable(DashboardActor $actor, mixed $brandId): void
    {
        $this->brands->ensureNotSuspended($actor, $brandId);
    }

    /**
     * @throws BrandSuspendedException
     * @throws BranchReadOnlyException
     */
    public function ensureBranchWritable(DashboardActor $actor, BranchModel $branch): void
    {
        if ($actor->isPlatformAdmin()) {
            return;
        }

        $this->ensureBrandWritable($actor, $branch->brand_id);

        if ($branch->status === BranchStatusEnum::Suspended) {
            throw new BranchReadOnlyException;
        }
    }
}
