<?php

declare(strict_types=1);

namespace Modules\Currency\Support;

use Modules\Currency\Constants\CurrencyMoneyConstants;

/** Converts integer minor-unit money to the major-unit decimal shown in aggregate read models. */
final class MinorUnits
{
    public static function toMajor(float|int|string $amountMinor): float
    {
        return (float) $amountMinor / CurrencyMoneyConstants::CURRENCY_MONEY_MINOR_UNITS_PER_MAJOR;
    }
}
