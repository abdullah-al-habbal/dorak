<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Illuminate\Support\Facades\DB;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;

final class StoreBranchEloquentResolver
{
    public function __construct(private readonly BranchHours $hours) {}

    public function resolve(array $attributes): BranchModel
    {
        $week = $attributes['opening_hours'] ?? null;
        unset($attributes['opening_hours']);

        return DB::transaction(function () use ($attributes, $week): BranchModel {
            $branch = BranchModel::query()->create($attributes);
            if (is_array($week)) {
                $this->hours->replaceWeek($branch, $week);
            }

            return $branch->load('openingHours');
        });
    }
}
