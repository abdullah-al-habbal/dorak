<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Illuminate\Support\Facades\DB;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;
use Modules\Branch\Services\BranchTimeZones;

final class UpdateBranchEloquentResolver
{
    public function __construct(
        private readonly BranchHours $hours,
        private readonly BranchTimeZones $zones,
    ) {}

    /** @param array<string, mixed> $attributes */
    public function resolve(BranchModel $branch, array $attributes): BranchModel
    {
        $week = $attributes['opening_hours'] ?? null;
        $zone = $attributes['timezone'] ?? null;
        unset($attributes['opening_hours'], $attributes['timezone']);

        DB::transaction(function () use ($branch, $attributes, $week, $zone): void {
            if (BranchStatusEnum::tryFrom((string) ($attributes['status'] ?? '')) === BranchStatusEnum::Disabled
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
            if (is_string($zone)) {
                $this->zones->set((string) $branch->getKey(), $zone);
            }
            if (is_array($week)) {
                $this->hours->replaceWeek($branch, $week);
            }
        });

        return ($branch->fresh() ?? $branch)->load('openingHours');
    }
}
