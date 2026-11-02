<?php

// modules/Marketing/Eloquent/Resolvers/Shared/FloorPlanDemoEloquentResolver.php

declare(strict_types=1);

namespace Modules\Marketing\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Marketing\Constants\MarketingFloorPlanDemoConstants;

final class FloorPlanDemoEloquentResolver
{
    public function getDemoFloorPlan(): ?array
    {
        $branch = BranchModel::query()->where('email', MarketingFloorPlanDemoConstants::MARKETING_FLOOR_PLAN_DEMO_BRANCH_EMAIL)->first();

        if ($branch === null) {
            return null;
        }

        $chairs = ChairModel::query()
            ->where('branch_id', $branch->id)
            ->orderBy('label')
            ->get();

        return [
            'branch' => [
                'id' => $branch->id,
                'name' => $branch->name,
            ],
            'canvas' => [
                'width' => 800,
                'height' => 600,
            ],
            'chairs' => $chairs->map(fn (ChairModel $chair): array => [
                'id' => $chair->id,
                'label' => $chair->label,
                'status' => $chair->status,
                'layout_settings' => $chair->layout_settings,
            ])->toArray(),
        ];
    }

    public function resolve(): Model|Collection|array|null
    {
        return $this->getDemoFloorPlan();
    }
}
