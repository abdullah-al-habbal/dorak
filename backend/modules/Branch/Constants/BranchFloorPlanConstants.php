<?php

declare(strict_types=1);

namespace Modules\Branch\Constants;

use Modules\Branch\Enums\FloorPlanCanvasUnit;

final class BranchFloorPlanConstants
{
    /** @var array{width: int, height: int, unit: string} */
    public const array BRANCH_FLOOR_PLAN_DEFAULT_CANVAS = ['width' => 20, 'height' => 15, 'unit' => FloorPlanCanvasUnit::Meters->value];
}
