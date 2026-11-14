<?php

declare(strict_types=1);

namespace Modules\Dashboard\Constants;

final class DashboardSessionConstants
{
    public const string DASHBOARD_SESSION_CLAIM_ALGORITHM = 'HS256';

    public const string DASHBOARD_SESSION_CLAIM_ISSUER = 'dorak-backend';

    /** Header every dashboard request carries; the claim in it is bound to the access token it was issued with (claim key `tid`). */
    public const string DASHBOARD_SESSION_CLAIM_HEADER = 'X-Dashboard-Session';
}
