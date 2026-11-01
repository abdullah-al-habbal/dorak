<?php

declare(strict_types=1);

namespace Modules\JobPosting\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;
use Illuminate\Support\Str;

enum ApplicationStatus: string implements HasColor, HasLabel
{
    case Submitted = 'submitted';
    case Seen = 'seen';
    case Accepted = 'accepted';
    case Rejected = 'rejected';

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
            self::Submitted => 'warning',
            self::Seen => 'info',
            self::Accepted => 'success',
            self::Rejected => 'danger',
        };
    }
}
