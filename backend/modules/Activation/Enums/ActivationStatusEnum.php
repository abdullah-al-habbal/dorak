<?php

// modules/Activation/Enums/ActivationStatusEnum.php
declare(strict_types=1);

namespace Modules\Activation\Enums;

use Filament\Support\Contracts\HasColor;

enum ActivationStatusEnum: string implements HasColor
{
    case Pending = 'pending';
    case Enabled = 'enabled';
    case Disabled = 'disabled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Enabled => 'Enabled',
            self::Disabled => 'Disabled',
        };
    }

    public function isEnabled(): bool
    {
        return $this === self::Enabled;
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Pending => 'warning',
            self::Enabled => 'success',
            self::Disabled => 'danger',
        };
    }
}
