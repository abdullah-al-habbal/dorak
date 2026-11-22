<?php

declare(strict_types=1);

namespace Modules\Booking\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case InProgress = 'in_progress';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
    case NoShow = 'no_show';

    public function label(): string
    {
        return __('booking::enums.booking_status.'.$this->value);
    }

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::Pending => in_array($target, [self::Confirmed, self::Cancelled], true),
            self::Confirmed => in_array($target, [self::InProgress, self::Cancelled, self::NoShow], true),
            self::InProgress => in_array($target, [self::Completed, self::Cancelled, self::NoShow], true),
            self::Completed, self::Cancelled, self::NoShow => false,
        };
    }

    /** @return list<string> */
    public static function reservationBlockingValues(): array
    {
        return [self::Pending->value, self::Confirmed->value, self::InProgress->value];
    }
}
