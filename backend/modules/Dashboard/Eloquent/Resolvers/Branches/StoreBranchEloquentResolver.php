<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Illuminate\Support\Facades\DB;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;
use Modules\Branch\Services\BranchTimeZones;

final class StoreBranchEloquentResolver
{
    public function __construct(
        private readonly BranchHours $hours,
        private readonly BranchTimeZones $zones,
    ) {}

    public function resolve(array $attributes): BranchModel
    {
        $week = $attributes['opening_hours'] ?? null;
        $zone = $attributes['timezone'] ?? null;
        unset($attributes['opening_hours'], $attributes['timezone']);

        return DB::transaction(function () use ($attributes, $week, $zone): BranchModel {
            $branch = BranchModel::query()->create($attributes);
            if (is_string($zone)) {
                $this->zones->set((string) $branch->getKey(), $zone);
            }
            if (is_array($week)) {
                $this->hours->replaceWeek($branch, $week);
            }

            return $branch->load('openingHours');
        });
    }
}
