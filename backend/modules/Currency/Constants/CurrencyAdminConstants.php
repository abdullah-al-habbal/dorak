<?php

declare(strict_types=1);

namespace Modules\Currency\Constants;

/** Limits for the admin's currency and exchange-rate forms. */
final class CurrencyAdminConstants
{
    public const int CODE_LENGTH = 3;

    public const int NAME_MAX_LENGTH = 80;

    public const int SYMBOL_MAX_LENGTH = 10;

    /** Matches the decimal(20, 6) column: 14 whole digits and 6 fraction digits. */
    public const string RATE_MAX = '99999999999999.999999';

    public const string RATE_MIN = '0.000001';
}
