<?php

declare(strict_types=1);

namespace Modules\Subscription\Enums;

enum SubscriptionIntervalUnitEnum: string
{
    case Day = 'day';
    case Week = 'week';
    case Month = 'month';
    case Year = 'year';

    public function label(): string
    {
        return __('subscription::enums.subscription_interval_unit.'.$this->value);
    }
}
