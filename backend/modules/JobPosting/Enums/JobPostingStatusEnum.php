<?php

declare(strict_types=1);

namespace Modules\JobPosting\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;
use Illuminate\Support\Str;

enum JobPostingStatusEnum: string implements HasColor, HasLabel
{
    case Open = 'open';
    case Closed = 'closed';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Open',
            self::Closed => 'Closed',
            self::Archived => 'Archived',
        };
    }

    public function isOpen(): bool
    {
        return $this === self::Open;
    }

    public function getLabel(): ?string
    {
        return Str::headline($this->value);
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Open => 'success',
            self::Closed => 'danger',
            self::Archived => 'gray',
        };
    }
}
