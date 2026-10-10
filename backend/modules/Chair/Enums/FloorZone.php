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
        return $this->value;
    }
}
