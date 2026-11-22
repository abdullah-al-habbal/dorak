<?php

declare(strict_types=1);

namespace Modules\Explore\Handlers\Public;

use Modules\Explore\CQRS\Query\Public\GetPublicProfileQuery;
use Modules\Explore\Eloquent\Resolvers\Public\GetPublicStylistProfileEloquentResolver;
use Modules\Explore\Http\Resources\Public\PublicStylistProfileResource;

final class GetPublicStylistProfileHandler
{
    public function __construct(
        private readonly GetPublicStylistProfileEloquentResolver $resolver,
    ) {}

    public function handle(GetPublicProfileQuery $query): PublicStylistProfileResource
    {
        return $this->resolver->resolve($query);
    }
}
