<?php

declare(strict_types=1);

namespace Modules\Preference\Support;

use Modules\Dashboard\Support\DashboardActor;

final class DashboardOwnerResolver
{
    /** @return array{0: string, 1: string} [ownerType, ownerId] */
    public static function resolve(DashboardActor $actor): array
    {
        $ownerType = match ($actor->actorType) {
            DashboardActor::ADMIN => 'admin',
            DashboardActor::BRANCH => 'branch',
            DashboardActor::BARBER => 'barber',
            DashboardActor::OWNER => 'client',
            default => $actor->actorType,
        };

        return [$ownerType, $actor->id];
    }
}
