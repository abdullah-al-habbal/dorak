<?php

declare(strict_types=1);

namespace Modules\Preference\Support;

use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Preference\Enums\PreferenceableTypeEnum;

final class DashboardOwnerResolver
{
    /** @return array{0: PreferenceableTypeEnum, 1: string} [ownerType, ownerId] */
    public static function resolve(DashboardActor $actor): array
    {
        $ownerType = match ($actor->actorType) {
            DashboardActorTypeEnum::Admin => PreferenceableTypeEnum::Admin,
            DashboardActorTypeEnum::Branch => PreferenceableTypeEnum::Branch,
            DashboardActorTypeEnum::Barber => PreferenceableTypeEnum::Barber,
            DashboardActorTypeEnum::Owner => PreferenceableTypeEnum::Client,
        };

        return [$ownerType, $actor->id];
    }
}
