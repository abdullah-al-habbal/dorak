<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Illuminate\Support\Facades\DB;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;

final class UpdateBranchEloquentResolver
{
    /** @param array<string, mixed> $attributes */
    public function resolve(BranchModel $branch, array $attributes): BranchModel
    {
        DB::transaction(function () use ($branch, $attributes): void {
            if (($attributes['status'] ?? null) === BranchStatusEnum::Disabled->value
                && $branch->getAttribute('status') === BranchStatusEnum::Enabled) {
                $branch->brand()->lockForUpdate()->first();
                $activeBranches = BranchModel::query()
                    ->where('brand_id', $branch->getAttribute('brand_id'))
                    ->where('status', BranchStatusEnum::Enabled->value)
                    ->count();

                if ($activeBranches <= 1) {
                    throw new BranchLifecycleConflictException('last_active_branch');
                }
            }

            $branch->update($attributes);
        });

        return $branch->fresh() ?? $branch;
    }
}
