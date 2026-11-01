<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Enums;

use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Contracts\MorphAliasEnum;

enum AffiliableType: string implements MorphAliasEnum
{
    case Branch = 'branch';
    case Brand = 'brand';

    public function label(): string
    {
        return $this->value;
    }

    public function modelClass(): string
    {
        return match ($this) {
            self::Branch => BranchModel::class,
            self::Brand => BrandModel::class,
        };
    }
}
