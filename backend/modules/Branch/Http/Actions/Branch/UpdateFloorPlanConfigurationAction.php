<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Branch\Enums\FloorPlanPreset;
use Modules\Branch\Http\Requests\Branch\UpdateFloorPlanConfigurationRequest;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;

final class UpdateFloorPlanConfigurationAction extends BaseApiAction
{
    public function __construct(private readonly BrandFeatures $brandFeatures) {}

    public function __invoke(UpdateFloorPlanConfigurationRequest $request): JsonResponse
    {
        $branch = $request->user('branch_api');

        if ($branch === null) {
            return $this->unauthorized();
        }

        Gate::forUser($branch)->authorize('manage', $branch);
        $this->brandFeatures->ensureBranchManageable($branch->getKey());
        $preset = $request->enum('preset', FloorPlanPreset::class);

        if ($preset === null) {
            return $this->unprocessable(errors: ['preset' => [__('branch::messages.invalid_floor_plan_preset')]]);
        }

        $zones = $request->array('zones');

        if ($preset === FloorPlanPreset::UnisexZoned && ! $this->hasRequiredZones($zones)) {
            return $this->unprocessable(errors: ['zones' => [__('branch::messages.unisex_layout_requires_both_zones')]]);
        }

        $branch->update(['floor_plan_preset' => $preset, 'floor_plan_zones' => $zones]);

        return $this->ok(data: ['preset' => $preset->value, 'zones' => $zones]);
    }

    /** @param iterable<mixed> $zones */
    private function hasRequiredZones(iterable $zones): bool
    {
        $zoneNames = [];

        foreach ($zones as $zone) {
            if (is_array($zone) && isset($zone['zone']) && is_string($zone['zone'])) {
                $zoneNames[] = $zone['zone'];
            }
        }

        return in_array('men', $zoneNames, true) && in_array('women', $zoneNames, true);
    }
}
