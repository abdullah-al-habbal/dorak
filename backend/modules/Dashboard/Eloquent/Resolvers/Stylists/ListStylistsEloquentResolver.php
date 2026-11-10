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
        return BarberModel::query()->with('chairs')
            ->when($query->chairId !== null, fn ($builder) => $builder->whereHas('chairs', fn ($chairs) => $chairs->whereKey($query->chairId)))
            ->when($query->status !== null, fn ($builder) => $builder->where('status', $query->status))
            ->when($query->branchIds !== null, fn ($builder) => $builder->whereHas(
                'chairs',
                fn ($chairs) => $chairs->whereIn('branch_id', $query->branchIds),
            ))
            // AND-ed with the actor's scope above, so a filter can narrow a list but never widen it.
            ->when($query->branchId !== null, fn ($builder) => $builder->whereHas('chairs', fn ($chairs) => $chairs->where('branch_id', $query->branchId)))
            ->when($query->search !== null, fn ($builder) => $builder->where(
                fn ($search) => $search->where('name->en', 'like', "%{$query->search}%")
                    ->orWhere('name->ar', 'like', "%{$query->search}%")
            ))
            ->paginate($query->perPage);
    }
}
