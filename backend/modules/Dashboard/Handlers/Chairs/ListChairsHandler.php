<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Chairs;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Dashboard\CQRS\Query\ListChairsQuery;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ListChairsEloquentResolver;

final readonly class ListChairsHandler
{
    public function __construct(private ListChairsEloquentResolver $resolver) {}

    public function handle(ListChairsQuery $query): LengthAwarePaginator
    {
        return $this->resolver->resolve($query);
    }
}
