<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Services;

use Modules\Dashboard\CQRS\Query\ShowServiceQuery;
use Modules\OfferedService\Models\OfferedServiceModel;

final class ShowServiceEloquentResolver
{
    public function resolve(ShowServiceQuery $query): OfferedServiceModel
    {
        return OfferedServiceModel::query()
            ->whereKey($query->serviceId)
            ->when($query->branchIds !== null, fn ($builder) => $builder
                ->where('serviceable_type', 'branch')
                ->whereIn('serviceable_id', $query->branchIds))
            ->firstOrFail();
    }
}
