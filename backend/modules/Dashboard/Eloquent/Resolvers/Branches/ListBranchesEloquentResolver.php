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
            ->when($query->brandId !== null, fn ($builder) => $builder->where('brand_id', $query->brandId))
            ->when($query->branchId !== null, fn ($builder) => $builder->whereKey($query->branchId))
            ->paginate($query->perPage);
    }
}
