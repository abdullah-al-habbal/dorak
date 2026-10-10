<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Stylists;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Barber\Models\BarberModel;
use Modules\Dashboard\CQRS\Query\ListStylistsQuery;

final class ListStylistsEloquentResolver
{
    public function resolve(ListStylistsQuery $query): LengthAwarePaginator
    {
        return BarberModel::query()
            ->when($query->branchId !== null, fn ($builder) => $builder->whereHas(
                'chairs',
                fn ($chairs) => $chairs->where('branch_id', $query->branchId),
            ))
            ->paginate($query->perPage);
    }
}
