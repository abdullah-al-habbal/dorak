<?php

declare(strict_types=1);

namespace Modules\Marketing\Enums;

enum UniverseVisibilityEnum: string
{
    case All = 'all';
    case Men = 'men';
    case Women = 'women';

    public function label(): string
    {
        return $this->value;
    }
}
