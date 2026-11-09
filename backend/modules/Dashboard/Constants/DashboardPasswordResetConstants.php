<?php

declare(strict_types=1);

namespace Modules\Dashboard\Constants;

/**
 * Dashboard password recovery (NS-01). The per-email limit on requests is the
 * launch default from docs/next-steps/01-decisions.md (operational defaults);
 * the reset step is limited per IP only, because a per-email cap there would
 * let anyone lock a victim out without adding protection to a 64-character token.
 */
final class DashboardPasswordResetConstants
{
    public const string DASHBOARD_PASSWORD_FORGOT_LIMITER = 'dashboard-password-forgot';

    public const string DASHBOARD_PASSWORD_RESET_LIMITER = 'dashboard-password-reset';

    public const int DASHBOARD_PASSWORD_FORGOT_PER_IP_PER_MINUTE = 5;

    public const int DASHBOARD_PASSWORD_FORGOT_PER_EMAIL_PER_HOUR = 5;

    public const int DASHBOARD_PASSWORD_RESET_PER_IP_PER_MINUTE = 5;

    public const int DASHBOARD_PASSWORD_MIN_LENGTH = 12;

    public const string DASHBOARD_PASSWORD_RULE_MIN = 'min:'.self::DASHBOARD_PASSWORD_MIN_LENGTH;

    /** The dashboard page that opens a reset link; `%s` is the portal segment. */
    public const string DASHBOARD_PASSWORD_RESET_PATH = '/dashboard/%s/reset-password';

    public const string DASHBOARD_PASSWORD_RESET_FRONTEND_URL_CONFIG = 'dashboard.dashboard.frontend_url';
}
