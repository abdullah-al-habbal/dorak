<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

/**
 * Route-level scope handed to the barber and client account-access middleware
 * as `EnsureXAccountAccess::class.':'.AccountAccessScope::Foo->value`.
 */
enum AccountAccessScope: string
{
    case Active = 'active';
    case Onboarding = 'onboarding';
    case Approved = 'approved';
    case Verification = 'verification';

    /** Unknown scopes fall back to the strictest one. */
    public static function fromParameter(string $scope): self
    {
        return self::tryFrom($scope) ?? self::Active;
    }
}
