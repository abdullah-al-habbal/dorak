<?php

declare(strict_types=1);

namespace Modules\Admin\Constants;

final class AdminUserConstants
{
    /** Named gate for managing platform admin accounts (NS-04). */
    public const string MANAGE_ABILITY = 'manage-admin-users';

    public const int SEARCH_MAX_LENGTH = 100;

    private function __construct() {}
}
