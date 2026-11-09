<?php

declare(strict_types=1);

namespace Modules\Dashboard\Repositories;

use Modules\Core\Enums\Locale;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Models\PreferenceModel;

/**
 * The language an account chose in its settings (`preferences.preferred_language`),
 * used for mail sent outside an authenticated request.
 */
final class DashboardPreferredLocaleResolver
{
    public function resolve(DashboardActorTypeEnum $actorType, string $accountId, string $fallback): string
    {
        $stored = PreferenceModel::query()
            ->toBase()
            ->where('preferenceable_type', $this->ownerType($actorType)->value)
            ->where('preferenceable_id', $accountId)
            ->value('preferred_language');

        return Locale::tryFrom(is_string($stored) ? $stored : '')?->value ?? $fallback;
    }

    private function ownerType(DashboardActorTypeEnum $actorType): PreferenceableTypeEnum
    {
        return match ($actorType) {
            DashboardActorTypeEnum::Admin => PreferenceableTypeEnum::Admin,
            DashboardActorTypeEnum::Branch => PreferenceableTypeEnum::Branch,
            DashboardActorTypeEnum::Barber => PreferenceableTypeEnum::Barber,
            DashboardActorTypeEnum::Owner => PreferenceableTypeEnum::Client,
        };
    }
}
