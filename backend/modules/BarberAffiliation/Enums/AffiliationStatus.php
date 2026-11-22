<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Enums;

enum AffiliationStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Rejected = 'rejected';
    case Terminated = 'terminated';

    public function label(): string
    {
        return __('barberaffiliation::enums.affiliation_status.'.$this->value);
    }
}
