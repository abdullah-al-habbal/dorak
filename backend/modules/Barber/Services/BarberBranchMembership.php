<?php

declare(strict_types=1);

namespace Modules\Barber\Services;

use Modules\Barber\Models\BarberModel;
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
            ->where('status', AffiliationStatus::Accepted->value)
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
}
