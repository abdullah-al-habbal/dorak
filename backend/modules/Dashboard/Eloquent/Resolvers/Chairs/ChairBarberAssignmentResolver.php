<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Chairs;

use Modules\Chair\Models\ChairModel;

final class ChairBarberAssignmentResolver
{
    public function ensureWithinBranch(?string $barberId, ?string $branchId): bool
    {
        if ($barberId === null || $branchId === null) {
            return true;
        }

        return ! ChairModel::query()
            ->where('barber_id', $barberId)
            ->where('branch_id', '!=', $branchId)
            ->exists();
    }
}
