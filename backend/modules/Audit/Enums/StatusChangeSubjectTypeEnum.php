<?php

declare(strict_types=1);

namespace Modules\Audit\Enums;

use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Models\BookingModel;
use Modules\Core\Contracts\MorphAliasEnum;

enum StatusChangeSubjectTypeEnum: string implements MorphAliasEnum
{
    case Booking = 'booking';
    case Affiliation = 'affiliation';

    public function modelClass(): string
    {
        return match ($this) {
            self::Booking => BookingModel::class,
            self::Affiliation => BarberAffiliationModel::class,
        };
    }
}
