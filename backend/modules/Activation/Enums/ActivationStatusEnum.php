<?php

// modules/Activation/Enums/ActivationStatusEnum.php
declare(strict_types=1);

namespace Modules\Activation\Enums;

enum ActivationStatusEnum: string
{
    case Pending = 'pending';
    case Enabled = 'enabled';
    case Disabled = 'disabled';

    public function label(): string
    {
        return __('activation::enums.activation_status.'.$this->value);
    }

    public function isEnabled(): bool
    {
        return $this === self::Enabled;
    }
}
