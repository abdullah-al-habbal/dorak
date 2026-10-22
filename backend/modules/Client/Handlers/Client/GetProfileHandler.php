<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Modules\Client\CQRS\Query\Client\GetProfileQuery;
use Modules\Client\Eloquent\Resolvers\Client\GetProfileEloquentResolver;
use Modules\Client\Models\ClientModel;

final class GetProfileHandler
{
    public function __construct(
        private readonly GetProfileEloquentResolver $resolver,
    ) {}

    public function handle(GetProfileQuery $query): ClientModel
    {
        return $this->resolver->resolve($query);
    }
}
