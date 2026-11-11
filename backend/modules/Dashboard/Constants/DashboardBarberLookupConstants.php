<?php

declare(strict_types=1);

namespace Modules\Dashboard\Constants;

final class DashboardBarberLookupConstants
{
    /** Named limiter for the barber lookup (invite flow). */
    public const string BARBER_LOOKUP_LIMITER = 'dashboard-barber-lookup';

    /** Per signed-in account; the search box debounces, so a person typing stays well below this. */
    public const int BARBER_LOOKUP_PER_ACCOUNT_PER_MINUTE = 30;

    /** The guards a dashboard session can come from. */
    public const array ACCOUNT_GUARDS = ['admin_api', 'branch_api', 'barber', 'client'];

    private function __construct() {}
}
