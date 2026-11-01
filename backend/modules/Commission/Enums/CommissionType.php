<?php

declare(strict_types=1);

namespace Modules\Commission\Enums;

enum CommissionType: string
{
    /** `value_bps` is basis points of the booking total (100 = 1%). */
    case Percent = 'percent';
    /** `value_amount_minor` is a fixed amount in minor units of the rule's currency. */
    case Flat = 'flat';
}
