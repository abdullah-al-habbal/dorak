<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Stylists;

use Modules\Barber\Models\BarberModel;
use Modules\Dashboard\CQRS\Query\ShowStylistQuery;

final class ShowStylistEloquentResolver
{
    public function resolve(ShowStylistQuery $query): BarberModel
    {
        return BarberModel::query()
            ->whereKey($query->stylistId)
            ->when($query->branchIds !== null, fn ($builder) => $builder->whereHas(
                'chairs',
                fn ($chairs) => $chairs->whereIn('branch_id', $query->branchIds),
            ))
            ->firstOrFail();
    }
}
