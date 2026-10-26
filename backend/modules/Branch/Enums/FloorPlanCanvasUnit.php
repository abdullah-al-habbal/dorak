<?php

declare(strict_types=1);

namespace Modules\Branch\Enums;

enum FloorPlanCanvasUnit: string
{
    case Meters = 'm';
    case Feet = 'ft';
    case Pixels = 'px';
}
