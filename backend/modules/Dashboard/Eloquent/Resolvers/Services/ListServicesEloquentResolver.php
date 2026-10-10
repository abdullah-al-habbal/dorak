<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Services;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Dashboard\CQRS\Query\ListServicesQuery;
use Modules\OfferedService\Models\OfferedServiceModel;

final class ListServicesEloquentResolver
{
    public function resolve(ListServicesQuery $query): LengthAwarePaginator
    {
        return OfferedServiceModel::query()
            ->when($query->branchId !== null, fn ($builder) => $builder
                ->where('serviceable_type', 'branch')
                ->where('serviceable_id', $query->branchId))
            ->paginate($query->perPage);
    }
}
