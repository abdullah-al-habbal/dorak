<?php

declare(strict_types=1);

namespace Modules\Explore\Constants;

final class ExploreRateLimitConstants
{
    public const string EXPLORE_LIMITER = 'explore';

    /** Public search, map browse and detail reads, per IP. */
    public const int EXPLORE_PER_MINUTE = 120;
}
