<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Stylists;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Dashboard\CQRS\Query\ListStylistsQuery;
use Modules\Dashboard\Eloquent\Resolvers\Stylists\ListStylistsEloquentResolver;

final readonly class ListStylistsHandler
{
    public function __construct(private ListStylistsEloquentResolver $resolver) {}

    public function handle(ListStylistsQuery $query): LengthAwarePaginator
    {
        return $this->resolver->resolve($query);
    }
}
