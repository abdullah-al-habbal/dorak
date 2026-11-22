<?php

declare(strict_types=1);

namespace Modules\Preference\Enums;

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Contracts\MorphAliasEnum;

enum PreferenceableTypeEnum: string implements MorphAliasEnum
{
    case Admin = 'admin';
    case Brand = 'brand';
    case Branch = 'branch';
    case Barber = 'barber';
    case Client = 'client';

    public function label(): string
    {
        return __('preference::enums.preferenceable_type.'.$this->value);
    }

    public function modelClass(): string
    {
        return match ($this) {
            self::Admin => AdminModel::class,
            self::Brand => BrandModel::class,
            self::Branch => BranchModel::class,
            self::Barber => BarberModel::class,
            self::Client => ClientModel::class,
        };
    }
}
