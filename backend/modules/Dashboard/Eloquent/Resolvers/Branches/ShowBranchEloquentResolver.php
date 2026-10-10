<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\CQRS\Query\ShowBranchQuery;

final class ShowBranchEloquentResolver
{
    public function resolve(ShowBranchQuery $query): BranchModel
    {
        return BranchModel::query()->when($query->scopeBrandId !== null, fn ($builder) => $builder->where('brand_id', $query->scopeBrandId))->findOrFail($query->id);
    }
}
