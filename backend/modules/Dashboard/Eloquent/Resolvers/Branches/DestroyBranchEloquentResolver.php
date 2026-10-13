<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Illuminate\Support\Facades\DB;
use LogicException;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;

final class DestroyBranchEloquentResolver
{
    public function resolve(BranchModel $branch): void
    {
        DB::transaction(function () use ($branch): void {
            $brandId = $branch->getAttribute('brand_id');
            BrandModel::query()->whereKey($brandId)->lockForUpdate()->first();
            $branches = BranchModel::query()->where('brand_id', $brandId);
            $isLastBranch = (clone $branches)->count() <= 1;
            $isLastActiveBranch = $branch->getAttribute('status') === BranchStatusEnum::Enabled
                && (clone $branches)->where('status', BranchStatusEnum::Enabled->value)->count() <= 1;

            if ($isLastBranch || $isLastActiveBranch) {
                throw new BranchLifecycleConflictException('last_branch');
            }

            $branchId = $branch->getAttribute('id');
            if (! is_string($branchId) && ! is_int($branchId)) {
                throw new LogicException('Branch identifier must be scalar.');
            }

            $hasUpcomingBookings = BookingModel::query()
                ->whereIn('status', BookingStatus::reservationBlockingValues())
                ->where('time_slot', '>', now())
                ->whereHas('chair', fn ($chairs) => $chairs->where('branch_id', (string) $branchId))
                ->exists();

            if ($hasUpcomingBookings) {
                throw new BranchLifecycleConflictException('upcoming_bookings');
            }

            $branch->delete();
        });
    }
}
