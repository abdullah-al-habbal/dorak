<?php

declare(strict_types=1);

namespace Modules\Dashboard\Constants;

/** Named limiters for the credential endpoints; each keeps its own counter per IP, so one route never spends the other's budget. */
final class DashboardLoginConstants
{
    public const string LOGIN_LIMITER = 'dashboard-login';

    public const string OWNER_BRAND_LIMITER = 'dashboard-owner-brand';

    private function __construct() {}
}
