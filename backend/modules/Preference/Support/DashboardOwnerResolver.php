<?php

declare(strict_types=1);

namespace Modules\Preference\Support;

use Modules\Dashboard\Constants\DashboardActorConstants;
use Modules\Dashboard\Support\DashboardActor;

final class DashboardOwnerResolver
{
    /** @return array{0: string, 1: string} [ownerType, ownerId] */
    public static function resolve(DashboardActor $actor): array
    {
        $ownerType = match ($actor->actorType) {
            DashboardActorConstants::DASHBOARD_ACTOR_ADMIN => 'admin',
            DashboardActorConstants::DASHBOARD_ACTOR_BRANCH => 'branch',
            DashboardActorConstants::DASHBOARD_ACTOR_BARBER => 'barber',
            DashboardActorConstants::DASHBOARD_ACTOR_OWNER => 'client',
            default => $actor->actorType,
        };

        return [$ownerType, $actor->id];
    }
}
