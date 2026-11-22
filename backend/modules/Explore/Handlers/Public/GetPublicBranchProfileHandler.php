<?php

declare(strict_types=1);

namespace Modules\Explore\Handlers\Public;

use Modules\Explore\CQRS\Query\Public\GetPublicProfileQuery;
use Modules\Explore\Eloquent\Resolvers\Public\GetPublicBranchProfileEloquentResolver;
use Modules\Explore\Http\Resources\Public\PublicBranchProfileResource;

final class GetPublicBranchProfileHandler
{
    public function __construct(
        private readonly GetPublicBranchProfileEloquentResolver $resolver,
    ) {}

    public function handle(GetPublicProfileQuery $query): PublicBranchProfileResource
    {
        return $this->resolver->resolve($query);
    }
}
