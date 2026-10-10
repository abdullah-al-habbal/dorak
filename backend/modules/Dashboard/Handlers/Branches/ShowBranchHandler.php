<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Branches;

use Modules\Dashboard\CQRS\Query\ShowBranchQuery;
use Modules\Dashboard\Eloquent\Resolvers\Branches\ShowBranchEloquentResolver;

final class ShowBranchHandler
{
    public function __construct(private readonly ShowBranchEloquentResolver $resolver) {}

    public function handle(ShowBranchQuery $query): mixed
    {
        return $this->resolver->resolve($query);
    }
}
