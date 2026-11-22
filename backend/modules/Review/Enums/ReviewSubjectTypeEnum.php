<?php

declare(strict_types=1);

namespace Modules\Review\Enums;

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Contracts\MorphAliasEnum;

enum ReviewSubjectTypeEnum: string implements MorphAliasEnum
{
    case Branch = 'branch';
    case Barber = 'barber';
    case Client = 'client';

    public function label(): string
    {
        return __('review::enums.review_subject_type.'.$this->value);
    }

    public function modelClass(): string
    {
        return match ($this) {
            self::Branch => BranchModel::class,
            self::Barber => BarberModel::class,
            self::Client => ClientModel::class,
        };
    }
}
