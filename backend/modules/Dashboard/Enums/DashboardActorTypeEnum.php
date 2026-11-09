<?php

declare(strict_types=1);

namespace Modules\Dashboard\Enums;

use Modules\Core\Enums\PasswordBrokerEnum;

enum DashboardActorTypeEnum: string
{
    case Admin = 'admin';
    case Branch = 'branch';
    case Barber = 'barber';
    case Owner = 'owner';

    public function label(): string
    {
        return $this->value;
    }

    /**
     * The dashboard URL segment of this actor's portal (`/dashboard/<segment>`).
     * It differs from the value for branch accounts, whose portal is `manager`.
     */
    public function portalSegment(): string
    {
        return match ($this) {
            self::Admin => 'admin',
            self::Branch => 'manager',
            self::Barber => 'barber',
            self::Owner => 'owner',
        };
    }

    /** The password broker that stores this actor's reset tokens. */
    public function passwordBroker(): PasswordBrokerEnum
    {
        return match ($this) {
            self::Admin => PasswordBrokerEnum::Admins,
            self::Branch => PasswordBrokerEnum::Branches,
            self::Barber => PasswordBrokerEnum::Barbers,
            self::Owner => PasswordBrokerEnum::Clients,
        };
    }

    /** The Laravel auth guard that authenticates this kind of dashboard actor. */
    public function guard(): string
    {
        return match ($this) {
            self::Admin => 'admin_api',
            self::Branch => 'branch_api',
            self::Barber => 'barber',
            self::Owner => 'client',
        };
    }
}
