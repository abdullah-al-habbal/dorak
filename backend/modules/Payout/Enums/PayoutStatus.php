<?php

declare(strict_types=1);

namespace Modules\Payout\Enums;

enum PayoutStatus: string
{
    case Draft = 'draft';
    case Approved = 'approved';
    case Paid = 'paid';
    case Canceled = 'canceled';

    public function canTransitionTo(self $next): bool
    {
        return match ($this) {
            self::Draft => in_array($next, [self::Approved, self::Canceled], true),
            self::Approved => in_array($next, [self::Paid, self::Canceled], true),
            self::Paid, self::Canceled => false,
        };
    }
}
