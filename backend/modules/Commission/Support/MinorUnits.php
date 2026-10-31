<?php

declare(strict_types=1);

namespace Modules\Commission\Support;

use Modules\Commission\Constants\CommissionMoneyConstants;

/** Converts the catalog's decimal prices to the integer minor units money is stored in. */
final class MinorUnits
{
    public static function fromDecimal(float|int|string $amount): int
    {
        return (int) round((float) $amount * (10 ** CommissionMoneyConstants::COMMISSION_MONEY_FRACTION_DIGITS));
    }
}
