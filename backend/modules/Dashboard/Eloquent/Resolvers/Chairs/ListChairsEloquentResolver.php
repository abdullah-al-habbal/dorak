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
            ->paginate($query->perPage);
    }
}
