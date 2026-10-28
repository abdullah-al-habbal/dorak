<?php

declare(strict_types=1);

namespace Modules\Commission\Enums;

enum CommissionScope: string
{
    case Global = 'global';
    case Brand = 'brand';
    case Branch = 'branch';

    /** Most specific first: the order the resolver tries them in. */
    public function precedence(): int
    {
        return match ($this) {
            self::Branch => 0,
            self::Brand => 1,
            self::Global => 2,
        };
    }
}
