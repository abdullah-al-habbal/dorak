<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;
use Illuminate\Support\Str;

enum AffiliationStatus: string implements HasColor, HasLabel
{
    case Pending = 'pending';
    case Active = 'active';
    case Rejected = 'rejected';
    case Terminated = 'terminated';

    public function label(): string
    {
        return $this->value;
    }

    public function getLabel(): ?string
    {
        return Str::headline($this->value);
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Pending => 'warning',
            self::Active => 'success',
            self::Rejected => 'danger',
            self::Terminated => 'gray',
        };
    }
}
