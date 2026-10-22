<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Stylists;

use Modules\Chair\Models\ChairModel;

final class StylistChairAssignmentResolver
{
    /**
     * Fails with 404 unless the chair is inside the actor's branch scope, and
     * returns that chair's branch. A null scope (platform admin) or no chair
     * skips the check and returns null.
     *
     * @param  list<string>|null  $branchIds
     */
    public function ensureWithinBranches(?string $chairId, ?array $branchIds): ?string
    {
        if ($branchIds === null || $chairId === null) {
            return null;
        }

        $branchId = ChairModel::query()
            ->whereKey($chairId)
            ->whereIn('branch_id', $branchIds)
            ->firstOrFail()
            ->getAttribute('branch_id');

        return is_string($branchId) || is_int($branchId) ? (string) $branchId : null;
    }
}
