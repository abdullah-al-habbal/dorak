<?php

declare(strict_types=1);

namespace Modules\Subscription\Enums;

enum SubscriptionStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case PastDue = 'past_due';
    case Canceled = 'canceled';

    public function canTransitionTo(self $next): bool
    {
        return match ($this) {
            self::Pending => in_array($next, [self::Active, self::Canceled], true),
            self::Active => in_array($next, [self::PastDue, self::Canceled], true),
            self::PastDue => in_array($next, [self::Active, self::Canceled], true),
            self::Canceled => false,
        };
    }

    /** Statuses whose plan features stay switched on (past_due is the grace period). */
    public function grantsFeatures(): bool
    {
        return $this === self::Active || $this === self::PastDue;
    }

    /** @return list<self> */
    public static function live(): array
    {
        return [self::Pending, self::Active, self::PastDue];
    }
}
