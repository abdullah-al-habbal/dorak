<?php

declare(strict_types=1);

namespace Modules\Payout\Enums;

enum PayoutDirection: string
{
    /** Pay-at-salon: the brand owes the platform its commission. */
    case BrandToPlatform = 'brand_to_platform';
    case PlatformToBrand = 'platform_to_brand';
}
