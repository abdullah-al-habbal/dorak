<?php

declare(strict_types=1);

namespace Modules\Preference\Eloquent\Resolvers;

use Modules\Preference\CQRS\Command\UpdateSettingsCommand;
use Modules\Preference\CQRS\Query\GetSettingsQuery;
use Modules\Preference\Models\PreferenceModel;

final class UpdateSettingsEloquentResolver
{
    public function __construct(private readonly GetOrCreateSettingsEloquentResolver $getOrCreate) {}

    public function resolve(UpdateSettingsCommand $command): PreferenceModel
    {
        $preference = $this->getOrCreate->resolve(new GetSettingsQuery($command->ownerType, $command->ownerId));
        $preference->fill($command->attributes);
        $preference->save();

        return $preference;
    }
}
