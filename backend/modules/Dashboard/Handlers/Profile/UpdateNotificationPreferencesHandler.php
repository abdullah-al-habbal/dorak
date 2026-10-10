<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Profile;

use Modules\Dashboard\CQRS\Command\UpdateNotificationPreferencesCommand;
use Modules\Dashboard\Eloquent\Resolvers\Profile\UpdateNotificationPreferencesEloquentResolver;
use Modules\Dashboard\Models\DashboardNotificationPreferenceModel;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateNotificationPreferencesHandler
{
    public function __construct(private readonly UpdateNotificationPreferencesEloquentResolver $resolver) {}

    public function handle(DashboardActor $actor, UpdateNotificationPreferencesCommand $command): DashboardNotificationPreferenceModel
    {
        return $this->resolver->resolve($actor, $command->preferences);
    }
}
