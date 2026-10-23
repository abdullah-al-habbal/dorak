<?php

declare(strict_types=1);

namespace Modules\Preference\Enums;

enum PriceDisplayModeEnum: string
{
    case TaxInclusive = 'tax_inclusive';
    case TaxExclusive = 'tax_exclusive';
}
