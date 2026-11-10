<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Chairs;

use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\CQRS\Query\ListChairsQuery;

final class ListChairsEloquentResolver
{
    /** @return LengthAwarePaginator<int, ChairModel> */
    public function resolve(ListChairsQuery $query): LengthAwarePaginator
    {
        $now = now();

        return ChairModel::query()
            ->with([
                'barber',
                'bookings' => function (Relation $bookings) use ($now) {
                    return BookingAvailability::apply($bookings->getQuery(), $now, $now->copy()->addSecond());
                },
            ])
            ->when($query->branchIds !== null, fn ($builder) => $builder->whereIn('branch_id', $query->branchIds))
            ->when($query->branchId !== null, fn ($builder) => $builder->where('branch_id', $query->branchId))
            ->when($query->brandId !== null, fn ($builder) => $builder->whereHas('branch', fn ($branches) => $branches->where('brand_id', $query->brandId)))
            ->when($query->status !== null, fn ($builder) => $builder->where('status', $query->status))
            ->when($query->floorZone !== null, fn ($builder) => $builder->where('floor_zone', $query->floorZone))
            ->when($query->search !== null, fn ($builder) => $builder->where('label', 'like', "%{$query->search}%"))
            ->paginate($query->perPage);
    }
}
