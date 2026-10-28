<?php

declare(strict_types=1);

namespace Modules\Commission\Support;

/** Converts the catalog's decimal prices to the integer minor units money is stored in. */
final class MinorUnits
{
    public const int FRACTION_DIGITS = 2;

    public const int BASIS_POINTS_DENOMINATOR = 10000;

    public static function fromDecimal(float|int|string $amount): int
    {
        return (int) round((float) $amount * (10 ** self::FRACTION_DIGITS));
    }
}
