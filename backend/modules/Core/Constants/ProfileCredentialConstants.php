<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

/** Guarding the credentials a profile update can change (BG-62). */
final class ProfileCredentialConstants
{
    public const string PROFILE_EMAIL_CHANGE_LIMITER = 'profile-email-change';

    /** Requests that carry an email, per account: each one may test the current password. */
    public const int PROFILE_EMAIL_CHANGE_PER_MINUTE = 5;
}
