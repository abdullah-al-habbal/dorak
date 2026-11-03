<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

/**
 * Sanctum abilities stamped on issued tokens. Legacy wildcard (`*`) tokens
 * keep passing every check; scoped tokens are limited to their own surface.
 */
enum TokenAbility: string
{
    case Dashboard = 'dashboard';
    case BranchApp = 'branch-app';
    case BarberApp = 'barber-app';
    case ClientActive = 'client-active';
    case EmailVerification = 'email-verification';

    /** @return list<string> */
    public static function mobileApp(): array
    {
        return [
            self::BranchApp->value,
            self::BarberApp->value,
            self::ClientActive->value,
            self::EmailVerification->value,
        ];
    }

    /** @return list<string> */
    public static function forBranchApp(): array
    {
        return [self::BranchApp->value];
    }

    /** @return list<string> */
    public static function forBarberApp(): array
    {
        return [self::BarberApp->value];
    }

    /** @return list<string> */
    public static function forDashboard(): array
    {
        return [self::Dashboard->value];
    }
}
