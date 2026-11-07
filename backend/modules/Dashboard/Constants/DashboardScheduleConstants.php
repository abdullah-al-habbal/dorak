<?php

declare(strict_types=1);

namespace Modules\Dashboard\Constants;

final class DashboardScheduleConstants
{
    public const int DASHBOARD_SCHEDULE_DEFAULT_PER_PAGE = 15;

    public const int DASHBOARD_SCHEDULE_MAX_PER_PAGE = 50;

    public const string DASHBOARD_SCHEDULE_DATE_FORMAT = 'Y-m-d';

    private function __construct() {}
}
