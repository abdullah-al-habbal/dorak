<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Services;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Dashboard\CQRS\Query\ListServicesQuery;
use Modules\Dashboard\Eloquent\Resolvers\Services\ListServicesEloquentResolver;

final readonly class ListServicesHandler
{
    public function __construct(private ListServicesEloquentResolver $resolver) {}

    public function handle(ListServicesQuery $query): LengthAwarePaginator
    {
        return $this->resolver->resolve($query);
    }
}
