<?php

declare(strict_types=1);

namespace Modules\Explore\Handlers\Public;

use Modules\Explore\CQRS\Query\Public\GetPublicProfileQuery;
use Modules\Explore\Eloquent\Resolvers\Public\GetPublicBrandProfileEloquentResolver;
use Modules\Explore\Http\Resources\Public\PublicBrandProfileResource;

final class GetPublicBrandProfileHandler
{
    public function __construct(
        private readonly GetPublicBrandProfileEloquentResolver $resolver,
    ) {}

    public function handle(GetPublicProfileQuery $query): PublicBrandProfileResource
    {
        return $this->resolver->resolve($query);
    }
}
