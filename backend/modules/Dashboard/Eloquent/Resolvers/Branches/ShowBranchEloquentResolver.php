<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\CQRS\Query\ShowBranchQuery;

final class ShowBranchEloquentResolver
{
    public function resolve(ShowBranchQuery $query): BranchModel
    {
        return BranchModel::query()
            ->when($query->scopeBrandIds !== null, fn ($builder) => $builder->whereIn('brand_id', $query->scopeBrandIds))
            ->when($query->scopeBranchIds !== null, fn ($builder) => $builder->whereKey($query->scopeBranchIds))
            ->findOrFail($query->id);
    }
}
