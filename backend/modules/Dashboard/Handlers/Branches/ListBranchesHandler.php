<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Branches;

use Modules\Dashboard\CQRS\Query\ListBranchesQuery;
use Modules\Dashboard\Eloquent\Resolvers\Branches\ListBranchesEloquentResolver;

final class ListBranchesHandler
{
    public function __construct(private readonly ListBranchesEloquentResolver $resolver) {}

    public function handle(ListBranchesQuery $query): mixed
    {
        return $this->resolver->resolve($query);
    }
}
