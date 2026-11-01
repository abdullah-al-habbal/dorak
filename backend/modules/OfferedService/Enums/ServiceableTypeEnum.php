<?php

declare(strict_types=1);

namespace Modules\OfferedService\Enums;

use Modules\Barber\Models\BarberModel;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Contracts\MorphAliasEnum;

enum ServiceableTypeEnum: string implements MorphAliasEnum
{
    case Brand = 'brand';
    case Barber = 'barber';

    public function label(): string
    {
        return $this->value;
    }

    public function modelClass(): string
    {
        return match ($this) {
            self::Brand => BrandModel::class,
            self::Barber => BarberModel::class,
        };
    }
}
