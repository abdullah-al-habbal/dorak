<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\CQRS\Query\ListBranchesQuery;

final class ListBranchesEloquentResolver
{
    public function resolve(ListBranchesQuery $query): LengthAwarePaginator
    {
        return BranchModel::query()->when($query->brandId !== null, fn ($builder) => $builder->where('brand_id', $query->brandId))->paginate($query->perPage);
    }
}
