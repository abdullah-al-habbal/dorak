<?php

declare(strict_types=1);

namespace Modules\Dashboard\Enums;

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
