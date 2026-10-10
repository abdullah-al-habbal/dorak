<?php

declare(strict_types=1);

namespace Modules\Branch\Enums;

enum FloorPlanPreset: string
{
    case Standard = 'standard';
    case Compact = 'compact';
    case UnisexZoned = 'unisex_zoned';

    public function label(): string
    {
        return $this->value;
    }
}
