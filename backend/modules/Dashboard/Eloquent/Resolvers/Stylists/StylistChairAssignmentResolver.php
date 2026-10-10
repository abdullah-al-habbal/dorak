<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Stylists;

use Modules\Chair\Models\ChairModel;

final class StylistChairAssignmentResolver
{
    public function ensureWithinBranch(?string $chairId, ?string $branchId): void
    {
        if ($branchId === null || $chairId === null) {
            return;
        }

        ChairModel::query()
            ->whereKey($chairId)
            ->where('branch_id', $branchId)
            ->firstOrFail();
    }
}
