<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Branches;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\CQRS\Query\ListBranchesQuery;
use Modules\Dashboard\Eloquent\Resolvers\Branches\ListBranchesEloquentResolver;

final class ListBranchesHandler
{
    public function __construct(private readonly ListBranchesEloquentResolver $resolver) {}

    /** @return LengthAwarePaginator<int, BranchModel> */
    public function handle(ListBranchesQuery $query): LengthAwarePaginator
    {
        return $this->resolver->resolve($query);
    }
}
