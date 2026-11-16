<?php

declare(strict_types=1);

namespace Modules\Dashboard\Constants;

final class DashboardBrandConstants
{
    /** Longest brand-name search the dashboard list accepts. */
    public const int DASHBOARD_BRAND_SEARCH_MAX_LENGTH = 100;

    /** Smallest page size; larger requests are clamped to the platform maximum instead of rejected (brand pickers ask for 100). */
    public const int DASHBOARD_BRAND_MIN_PER_PAGE = 1;

    /** FT-9: a brand logo upload, in kilobytes (Laravel's `max` unit), the allowed formats and the folder on the public disk. */
    public const int DASHBOARD_BRAND_LOGO_MAX_KB = 2048;

    public const string DASHBOARD_BRAND_LOGO_MIMES = 'jpeg,png,webp';

    public const string DASHBOARD_BRAND_LOGO_DIRECTORY = 'brand-logos';

    /** Widest or tallest logo, in pixels, so a decompression bomb is refused before it is stored. */
    public const int DASHBOARD_BRAND_LOGO_MAX_SIDE = 4096;

    private function __construct() {}
}
