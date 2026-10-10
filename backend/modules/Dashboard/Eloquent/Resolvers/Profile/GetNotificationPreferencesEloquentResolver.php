<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Profile;

use Modules\Dashboard\CQRS\Query\GetNotificationPreferencesQuery;
use Modules\Dashboard\Models\DashboardNotificationPreferenceModel;

final class GetNotificationPreferencesEloquentResolver
{
    public function resolve(GetNotificationPreferencesQuery $query): ?DashboardNotificationPreferenceModel
    {
        return DashboardNotificationPreferenceModel::query()
            ->where('actor_type', $query->actorType)
            ->where('actor_id', $query->actorId)
            ->first();
    }
}
