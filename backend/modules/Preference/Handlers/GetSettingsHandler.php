<?php

declare(strict_types=1);

namespace Modules\Preference\Handlers;

use Modules\Preference\CQRS\Query\GetSettingsQuery;
use Modules\Preference\Eloquent\Resolvers\GetOrCreateSettingsEloquentResolver;
use Modules\Preference\Models\PreferenceModel;

final class GetSettingsHandler
{
    public function __construct(private readonly GetOrCreateSettingsEloquentResolver $resolver) {}

    public function handle(GetSettingsQuery $query): PreferenceModel
    {
        return $this->resolver->resolve($query);
    }
}
