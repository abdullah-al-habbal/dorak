<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Enums;

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Contracts\MorphAliasEnum;

enum AffiliationInitiatorTypeEnum: string implements MorphAliasEnum
{
    case Branch = 'branch';
    case Barber = 'barber';

    public function label(): string
    {
        return $this->value;
    }

    public function modelClass(): string
    {
        return match ($this) {
            self::Branch => BranchModel::class,
            self::Barber => BarberModel::class,
        };
    }
}
