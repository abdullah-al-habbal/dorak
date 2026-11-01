<?php

declare(strict_types=1);

namespace Modules\Activation\Enums;

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Contracts\MorphAliasEnum;

enum ActivableTypeEnum: string implements MorphAliasEnum
{
    case Branch = 'branch';
    case Barber = 'barber';
    case Brand = 'brand';
    case Client = 'client';

    public function label(): string
    {
        return $this->value;
    }

    public function modelClass(): string
    {
        return match ($this) {
            self::Branch => BranchModel::class,
            self::Barber => BarberModel::class,
            self::Brand => BrandModel::class,
            self::Client => ClientModel::class,
        };
    }
}
