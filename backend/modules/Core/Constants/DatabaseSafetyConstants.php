<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

final class DatabaseSafetyConstants
{
    /** Hosts that are this machine. Destructive commands (migrate:fresh, db:wipe, ...) refuse any other host. */
    public const array DATABASE_SAFETY_LOCAL_HOSTS = ['127.0.0.1', 'localhost', '::1'];
}
