<?php

declare(strict_types=1);

namespace Modules\Preference\Eloquent\Resolvers;

use Modules\Preference\CQRS\Query\GetSettingsQuery;
use Modules\Preference\Models\PreferenceModel;

final class GetOrCreateSettingsEloquentResolver
{
    public function resolve(GetSettingsQuery $query): PreferenceModel
    {
        return PreferenceModel::query()->firstOrCreate(
            [
                'preferenceable_type' => $query->ownerType,
                'preferenceable_id' => $query->ownerId,
            ],
            ['notification_enabled' => true],
        );
    }
}
