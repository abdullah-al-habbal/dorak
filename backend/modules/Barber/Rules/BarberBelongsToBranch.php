<?php

declare(strict_types=1);

namespace Modules\Barber\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;

final readonly class BarberBelongsToBranch implements ValidationRule
{
    public function __construct(private ?string $branchId) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $this->branchId === null) {
            return;
        }

        $branch = BranchModel::query()->find($this->branchId);
        if ($branch === null) {
            $fail(__('barber::messages.not_member_of_branch'));

            return;
        }

        $managedByBranch = BarberModel::query()
            ->whereKey($value)
            ->where('managed_by_branch_id', $branch->id)
            ->exists();

        $acceptedAffiliation = BarberAffiliationModel::query()
            ->where('barber_id', $value)
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

        if (! $managedByBranch && ! $acceptedAffiliation) {
            $fail(__('barber::messages.not_member_of_branch'));
        }
    }
}
