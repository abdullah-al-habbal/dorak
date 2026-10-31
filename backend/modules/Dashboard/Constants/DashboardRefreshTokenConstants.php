<?php

declare(strict_types=1);

namespace Modules\Dashboard\Constants;

final class DashboardRefreshTokenConstants
{
    public const int DASHBOARD_REFRESH_TOKEN_DEFAULT_TTL_SECONDS = 2592000;

    public const int DASHBOARD_REFRESH_TOKEN_MINIMUM_TTL_SECONDS = 3600;
}
