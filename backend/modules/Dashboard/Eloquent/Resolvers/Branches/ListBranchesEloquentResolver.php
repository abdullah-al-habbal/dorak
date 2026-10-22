<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\CQRS\Query\ListBranchesQuery;

final class ListBranchesEloquentResolver
{
    /** @return LengthAwarePaginator<int, BranchModel> */
    public function resolve(ListBranchesQuery $query): LengthAwarePaginator
    {
        return BranchModel::query()
            ->when($query->brandIds !== null, fn ($builder) => $builder->whereIn('brand_id', $query->brandIds))
            ->when($query->branchIds !== null, fn ($builder) => $builder->whereKey($query->branchIds))
            ->paginate($query->perPage);
    }
}
