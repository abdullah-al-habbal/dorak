<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Profile;

use Modules\Dashboard\CQRS\Query\GetNotificationPreferencesQuery;
use Modules\Dashboard\Eloquent\Resolvers\Profile\GetNotificationPreferencesEloquentResolver;
use Modules\Dashboard\Models\DashboardNotificationPreferenceModel;

final class GetNotificationPreferencesHandler
{
    public function __construct(private readonly GetNotificationPreferencesEloquentResolver $resolver) {}

    public function handle(GetNotificationPreferencesQuery $query): ?DashboardNotificationPreferenceModel
    {
        return $this->resolver->resolve($query);
    }
}
