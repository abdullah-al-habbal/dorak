<?php

declare(strict_types=1);

namespace Modules\Branch\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;
use Illuminate\Support\Str;

enum BranchStatusEnum: string implements HasColor, HasLabel
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

    public function getLabel(): ?string
    {
        return Str::headline($this->value);
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
