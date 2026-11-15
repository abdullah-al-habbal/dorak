<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Enums\FloorPlanPreset;
use Modules\Branch\Http\Requests\Branch\UpdateFloorPlanConfigurationRequest;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Support\FloorPlanLayout;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBranchQuery;
use Modules\Dashboard\Handlers\Branches\ShowBranchHandler;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateBranchFloorPlanAction extends BaseApiAction
{
    public function __construct(
        private readonly ShowBranchHandler $handler,
        private readonly BrandFeatures $brandFeatures,
        private readonly DashboardWriteGuard $writeGuard,
    ) {}

    public function __invoke(UpdateFloorPlanConfigurationRequest $request, string $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        /** @var BranchModel $model */
        $model = $this->handler->handle(new ShowBranchQuery($branch, $actor->scopedBrandIds(), $actor->scopedBranchIds()));
        $this->brandFeatures->ensureBranchManageable($model->getKey());
        $this->writeGuard->ensureBranchWritable($actor, $model);

        $preset = $request->enum('preset', FloorPlanPreset::class);
        $zones = $request->array('zones');
        if ($preset === FloorPlanPreset::UnisexZoned && ! $this->hasRequiredZones($zones)) {
            return $this->unprocessable(errors: ['zones' => [__('branch::messages.unisex_layout_requires_both_zones')]]);
        }

        $layout = $request->safe()->only(['canvas', 'decorations']);
        $model->update([
            'floor_plan_preset' => $preset,
            'floor_plan_zones' => $zones,
            ...isset($layout['canvas']) ? ['floor_plan_canvas' => $layout['canvas']] : [],
            ...isset($layout['decorations']) ? ['floor_plan_decorations' => $layout['decorations']] : [],
        ]);

        return $this->success(FloorPlanLayout::payload($model->refresh()));
    }

    /** @param array<int, mixed> $zones */
    private function hasRequiredZones(array $zones): bool
    {
        $names = array_column(array_filter($zones, 'is_array'), 'zone');

        return in_array('men', $names, true) && in_array('women', $names, true);
    }
}
