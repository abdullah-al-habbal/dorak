<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Handlers\Shared;

use Illuminate\Database\Eloquent\Collection;
use Modules\ServiceCatalog\CQRS\Query\Shared\ListCategoriesQuery;
use Modules\ServiceCatalog\Eloquent\Resolvers\Shared\ListCategoriesEloquentResolver;

final class ListCategoriesHandler
{
    public function __construct(
        private readonly ListCategoriesEloquentResolver $resolver,
    ) {}

    public function handle(ListCategoriesQuery $payload): Collection
    {
        return $this->resolver->resolve($payload);
    }
}
