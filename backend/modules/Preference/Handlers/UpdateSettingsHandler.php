<?php

declare(strict_types=1);

namespace Modules\Preference\Handlers;

use Modules\Preference\CQRS\Command\UpdateSettingsCommand;
use Modules\Preference\Eloquent\Resolvers\UpdateSettingsEloquentResolver;
use Modules\Preference\Models\PreferenceModel;

final class UpdateSettingsHandler
{
    public function __construct(private readonly UpdateSettingsEloquentResolver $resolver) {}

    public function handle(UpdateSettingsCommand $command): PreferenceModel
    {
        return $this->resolver->resolve($command);
    }
}
