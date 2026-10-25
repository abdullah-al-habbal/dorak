<?php

declare(strict_types=1);

namespace Modules\Barber\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Modules\Barber\Services\BarberBranchMembership;
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

        if (! (new BarberBranchMembership)->belongsTo((string) $value, $branch)) {
            $fail(__('barber::messages.not_member_of_branch'));
        }
    }
}
