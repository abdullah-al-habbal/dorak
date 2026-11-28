<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Illuminate\Support\Facades\DB;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;
use Modules\Branch\Services\BranchTimeZones;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Services\DashboardCredentialRevoker;

final class UpdateBranchEloquentResolver
{
    public function __construct(
        private readonly BranchHours $hours,
        private readonly BranchTimeZones $zones,
        private readonly DashboardCredentialRevoker $credentials,
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
            // Whoever sets it, every session of the branch ends with the old password (BG-63).
            if (isset($attributes['password'])) {
                $this->credentials->revokeAll(DashboardActorTypeEnum::Branch, $branch);
            }
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
