<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Profile;

use Modules\Dashboard\Models\DashboardNotificationPreferenceModel;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateNotificationPreferencesEloquentResolver
{
    /** @param array<string, bool> $preferences */
    public function resolve(DashboardActor $actor, array $preferences): DashboardNotificationPreferenceModel
    {
        return DashboardNotificationPreferenceModel::query()->updateOrCreate(
            ['actor_type' => $actor->actorType, 'actor_id' => $actor->id],
            $preferences,
        );
    }
}
