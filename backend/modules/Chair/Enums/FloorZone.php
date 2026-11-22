<?php

declare(strict_types=1);

namespace Modules\Chair\Enums;

enum FloorZone: string
{
    case Men = 'men';
    case Women = 'women';
    case Shared = 'shared';

    public function label(): string
    {
        return __('chair::enums.floor_zone.'.$this->value);
    }
}
