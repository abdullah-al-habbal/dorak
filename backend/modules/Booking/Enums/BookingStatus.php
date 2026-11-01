<?php

declare(strict_types=1);

namespace Modules\Booking\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;
use Illuminate\Support\Str;

enum BookingStatus: string implements HasColor, HasLabel
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case InProgress = 'in_progress';
    case Canceled = 'canceled';
    case Completed = 'completed';
    case NoShow = 'no_show';

    public function label(): string
    {
        return $this->value;
    }

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::Pending => in_array($target, [self::Confirmed, self::Canceled], true),
            self::Confirmed => in_array($target, [self::InProgress, self::Canceled, self::NoShow], true),
            self::InProgress => in_array($target, [self::Completed, self::Canceled, self::NoShow], true),
            self::Completed, self::Canceled, self::NoShow => false,
        };
    }

    /** @return list<string> */
    public static function reservationBlockingValues(): array
    {
        return [self::Pending->value, self::Confirmed->value, self::InProgress->value];
    }

    public function getLabel(): ?string
    {
        return Str::headline($this->value);
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Pending => 'gray',
            self::Confirmed => 'success',
            self::InProgress => 'warning',
            self::Canceled => 'danger',
            self::Completed => 'info',
            self::NoShow => 'gray',
        };
    }
}
