<?php

declare(strict_types=1);

namespace Modules\Brand\Services;

use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Exceptions\BrandNotApprovedException;
use Modules\Brand\Models\BrandModel;

/**
 * D11, as resolved 2026-11-13: accepting a barber's join request counts as adding a barber, so a
 * `Pending` brand may not create, send or accept an affiliation, whoever acts (the platform admin
 * approves the brand first). Rejecting and terminating stay allowed. Call it inside the
 * transaction that changes the affiliation: the brand row is locked, so a throw rolls everything back.
 */
final class BrandStaffingGuard
{
    /** @throws BrandNotApprovedException */
    public function ensureBrandAcceptsBarbers(mixed $brandId): void
    {
        if ($brandId === null) {
            return;
        }

        $brand = BrandModel::query()->lockForUpdate()->find($brandId);

        if ($brand instanceof BrandModel && $brand->status === BrandStatusEnum::Pending) {
            throw new BrandNotApprovedException;
        }
    }

    /** @throws BrandNotApprovedException */
    public function ensureBranchAcceptsBarbers(mixed $branchId): void
    {
        $this->ensureBrandAcceptsBarbers(BranchModel::query()->whereKey($branchId)->value('brand_id'));
    }
}
