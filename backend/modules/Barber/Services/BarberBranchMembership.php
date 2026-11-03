<?php

declare(strict_types=1);

namespace Modules\Barber\Services;

use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;

final class BarberBranchMembership
{
    /** Whether a barber is managed by, or holds an accepted affiliation with, a branch (or its brand). */
    public function belongsTo(string $barberId, BranchModel $branch): bool
    {
        $managedByBranch = BarberModel::query()
            ->whereKey($barberId)
            ->where('managed_by_branch_id', $branch->id)
            ->exists();

        if ($managedByBranch) {
            return true;
        }

        return BarberAffiliationModel::query()
            ->where('barber_id', $barberId)
            ->where('status', AffiliationStatus::Active->value)
            ->where(function ($query) use ($branch): void {
                $query->where(function ($branchQuery) use ($branch): void {
                    $branchQuery->where('affiliable_type', 'branch')
                        ->where('affiliable_id', $branch->id);
                });

                if ($branch->brand_id !== null) {
                    $query->orWhere(function ($brandQuery) use ($branch): void {
                        $brandQuery->where('affiliable_type', 'brand')
                            ->where('affiliable_id', $branch->brand_id);
                    });
                }
            })
            ->exists();
    }

    /** Whether a barber works for a brand: managed by one of its branches, or affiliated (Active) with the brand or one of its branches. */
    public function belongsToBrand(string $barberId, string $brandId): bool
    {
        $branchIds = BranchModel::query()->where('brand_id', $brandId)->select('id');

        $managedByBrand = BarberModel::query()
            ->whereKey($barberId)
            ->whereIn('managed_by_branch_id', $branchIds)
            ->exists();

        if ($managedByBrand) {
            return true;
        }

        return BarberAffiliationModel::query()
            ->where('barber_id', $barberId)
            ->where('status', AffiliationStatus::Active->value)
            ->where(function ($query) use ($brandId, $branchIds): void {
                $query->where(fn ($brand) => $brand->where('affiliable_type', AffiliableType::Brand->value)->where('affiliable_id', $brandId))
                    ->orWhere(fn ($branch) => $branch->where('affiliable_type', AffiliableType::Branch->value)->whereIn('affiliable_id', $branchIds));
            })
            ->exists();
    }
}
