<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Chairs;

use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\CQRS\Query\ShowChairQuery;

final class ShowChairEloquentResolver
{
    public function resolve(ShowChairQuery $query): ChairModel
    {
        return ChairModel::query()
            ->with('barber')
            ->whereKey($query->chairId)
            ->when($query->branchId !== null, fn ($builder) => $builder->where('branch_id', $query->branchId))
            ->firstOrFail();
    }
}
