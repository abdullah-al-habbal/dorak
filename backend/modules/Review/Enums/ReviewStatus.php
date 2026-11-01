<?php

declare(strict_types=1);

namespace Modules\Review\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;
use Illuminate\Support\Str;

enum ReviewStatus: string implements HasColor, HasLabel
{
    case Published = 'published';
    case Disputed = 'disputed';
    case Resolved = 'resolved';
    case Hidden = 'hidden';

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
            self::Published => 'success',
            self::Disputed => 'warning',
            self::Resolved => 'info',
            self::Hidden => 'gray',
        };
    }
}
