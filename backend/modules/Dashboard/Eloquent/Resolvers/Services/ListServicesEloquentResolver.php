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
            ->when($query->brandIds !== null, fn ($builder) => $builder
                ->where('serviceable_type', 'brand')
                ->whereIn('serviceable_id', $query->brandIds))
            ->when($query->search !== null, fn ($builder) => $builder->where(
                fn ($search) => $search->where('name->en', 'like', "%{$query->search}%")
                    ->orWhere('name->ar', 'like', "%{$query->search}%")
            ))
            ->paginate($query->perPage);
    }
}
