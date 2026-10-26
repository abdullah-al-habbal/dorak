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
            ->when($query->branchIds !== null, fn ($builder) => $builder->whereHas(
                'chairs',
                fn ($chairs) => $chairs->whereIn('branch_id', $query->branchIds),
            ))
            ->when($query->search !== null, fn ($builder) => $builder->where(
                fn ($search) => $search->where('name->en', 'like', "%{$query->search}%")
                    ->orWhere('name->ar', 'like', "%{$query->search}%")
            ))
            ->paginate($query->perPage);
    }
}
