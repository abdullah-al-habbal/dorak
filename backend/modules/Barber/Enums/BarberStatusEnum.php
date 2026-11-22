<?php

declare(strict_types=1);

namespace Modules\Barber\Enums;

enum BarberStatusEnum: string
{
    case Pending = 'pending';
    case Enabled = 'enabled';
    case Disabled = 'disabled';
    case Rejected = 'rejected';

    public function label(): string
    {
        return __('barber::enums.barber_status.'.$this->value);
    }

    public function isEnabled(): bool
    {
        return $this === self::Enabled;
    }
}
