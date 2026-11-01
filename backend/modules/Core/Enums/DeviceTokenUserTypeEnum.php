<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Contracts\MorphAliasEnum;

enum DeviceTokenUserTypeEnum: string implements MorphAliasEnum
{
    case Admin = 'admin';
    case Branch = 'branch';
    case Barber = 'barber';
    case Client = 'client';

    public function label(): string
    {
        return $this->value;
    }

    public function modelClass(): string
    {
        return match ($this) {
            self::Admin => AdminModel::class,
            self::Branch => BranchModel::class,
            self::Barber => BarberModel::class,
            self::Client => ClientModel::class,
        };
    }
}
