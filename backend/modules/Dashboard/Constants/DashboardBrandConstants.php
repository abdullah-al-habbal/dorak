<?php

declare(strict_types=1);

namespace Modules\Dashboard\Constants;

final class DashboardBrandConstants
{
    /** Longest brand-name search the dashboard list accepts. */
    public const int DASHBOARD_BRAND_SEARCH_MAX_LENGTH = 100;

    /** Smallest page size; larger requests are clamped to the platform maximum instead of rejected (brand pickers ask for 100). */
    public const int DASHBOARD_BRAND_MIN_PER_PAGE = 1;

    private function __construct() {}
}
