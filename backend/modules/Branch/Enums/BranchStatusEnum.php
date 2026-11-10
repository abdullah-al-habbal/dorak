<?php

declare(strict_types=1);

namespace Modules\Branch\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum BranchStatusEnum: string implements HasColor, HasLabel
{
    case Pending = 'pending';
    case Enabled = 'enabled';
    case Disabled = 'disabled';
    case Suspended = 'suspended';

    public function label(): string
    {
        return __('branch::enums.status.'.$this->value);
    }

    public function isEnabled(): bool
    {
        return $this === self::Enabled;
    }

    public function getLabel(): ?string
    {
        return $this->label();
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Pending => 'warning',
            self::Enabled => 'success',
            self::Disabled => 'danger',
            self::Suspended => 'gray',
        };
    }
}
