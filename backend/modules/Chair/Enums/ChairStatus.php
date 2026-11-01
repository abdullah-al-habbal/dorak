<?php

declare(strict_types=1);

namespace Modules\Chair\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;
use Illuminate\Support\Str;

enum ChairStatus: string implements HasColor, HasLabel
{
    case Available = 'available';
    case Occupied = 'occupied';
    case Maintenance = 'maintenance';

    public function label(): string
    {
        return $this->value;
    }

    public function isBookable(): bool
    {
        return $this === self::Available;
    }

    public function getLabel(): ?string
    {
        return Str::headline($this->value);
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Available => 'success',
            self::Occupied => 'warning',
            self::Maintenance => 'danger',
        };
    }
}
