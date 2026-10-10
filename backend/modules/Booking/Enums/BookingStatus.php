<?php

declare(strict_types=1);

namespace Modules\Booking\Enums;

enum BookingStatus: string
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
            self::Confirmed => in_array($target, [self::InProgress, self::Canceled], true),
            self::InProgress => in_array($target, [self::Completed, self::Canceled, self::NoShow], true),
            self::Completed, self::Canceled, self::NoShow => false,
        };
    }

    /** @return list<string> */
    public static function availabilityBlockingValues(): array
    {
        return [self::Confirmed->value, self::InProgress->value];
    }

    /** @return list<string> */
    public static function reservationBlockingValues(): array
    {
        return [self::Pending->value, ...self::availabilityBlockingValues()];
    }
}
