<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

/**
 * The password brokers configured in `Core/Config/auth.php` (`auth.passwords.*`).
 * Each one keeps its hashed, expiring reset tokens in its own
 * `password_reset_tokens_*` table.
 */
enum PasswordBrokerEnum: string
{
    case Admins = 'admins';
    case Branches = 'branches';
    case Barbers = 'barbers';
    case Clients = 'clients';
}
