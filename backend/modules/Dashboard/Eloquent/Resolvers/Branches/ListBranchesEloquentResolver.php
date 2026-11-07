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
            ->when($query->status !== null, fn ($builder) => $builder->where('status', $query->status))
            ->when($query->brandId !== null, fn ($builder) => $builder->where('brand_id', $query->brandId))
            ->when($query->search !== null, fn ($builder) => $builder->where(
                fn ($search) => $search->where('name->en', 'like', "%{$query->search}%")
                    ->orWhere('name->ar', 'like', "%{$query->search}%")
            ))
            ->paginate($query->perPage);
    }
}
