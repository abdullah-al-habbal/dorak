<?php

declare(strict_types=1);

namespace Modules\Explore\Handlers\Shared;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Explore\CQRS\Query\Shared\ExploreSearchQuery;
use Modules\Explore\Eloquent\Resolvers\Shared\ExploreSearchEloquentResolver;

final class ExploreSearchHandler
{
    public function __construct(
        private readonly ExploreSearchEloquentResolver $resolver,
    ) {}

    public function handle(ExploreSearchQuery $query): LengthAwarePaginator
    {
        return $this->resolver->resolve($query);
    }
}
