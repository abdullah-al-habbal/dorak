<?php

declare(strict_types=1);

namespace Modules\Dashboard\Constants;

/**
 * Public brand-owner registration (NS-03). The limits are the launch defaults
 * from docs/next-steps/01-decisions.md: 5 per minute per IP and 5 per hour per
 * email for sign-ups and code resends. Verifying a code has its own, looser
 * per-email cap, which bounds a guess of the 6-digit code to a few per hour.
 */
final class OwnerRegistrationConstants
{
    public const string OWNER_REGISTER_LIMITER = 'dashboard-owner-register';

    public const string OWNER_VERIFY_LIMITER = 'dashboard-owner-verify';

    public const int OWNER_REGISTER_PER_IP_PER_MINUTE = 5;

    public const int OWNER_REGISTER_PER_EMAIL_PER_HOUR = 5;

    public const int OWNER_VERIFY_PER_IP_PER_MINUTE = 10;

    public const int OWNER_VERIFY_PER_EMAIL_PER_HOUR = 10;

    /** Never-verified sign-ups older than this are removed by the scheduled clean-up. */
    public const int UNVERIFIED_SIGNUP_RETENTION_DAYS = 7;

    /** A hidden form field that people leave empty; a filled one means a bot. */
    public const string HONEYPOT_FIELD = 'website';

    public const string PURGE_COMMAND = 'signups:purge-unverified';

    public const string PURGE_TIME = '03:30';
}
