<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

/** Scopes of the staff mobile password-reset codes kept by `StaffPasswordResetCodes`. */
final class StaffPasswordResetConstants
{
    public const string STAFF_PASSWORD_RESET_SCOPE_BRANCH = 'branch';

    public const string STAFF_PASSWORD_RESET_SCOPE_BARBER = 'barber';
}
