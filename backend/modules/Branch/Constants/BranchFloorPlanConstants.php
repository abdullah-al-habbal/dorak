<?php

declare(strict_types=1);

namespace Modules\Branch\Constants;

final class BranchFloorPlanConstants
{
    public const int BRANCH_FLOOR_PLAN_MAX_DECORATIONS = 30;

    public const int BRANCH_FLOOR_PLAN_MAX_CANVAS_SIZE = 1000;

    public const int BRANCH_FLOOR_PLAN_MAX_LABEL_LENGTH = 60;

    /** @var array{width: int, height: int, unit: string} */
    public const array BRANCH_FLOOR_PLAN_DEFAULT_CANVAS = ['width' => 20, 'height' => 15, 'unit' => 'm'];
}
