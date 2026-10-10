<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Chairs;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Booking\Enums\BookingStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\CQRS\Query\ListChairsQuery;

final class ListChairsEloquentResolver
{
    public function resolve(ListChairsQuery $query): LengthAwarePaginator
    {
        return ChairModel::query()
            ->with([
                'barber',
                'bookings' => fn ($bookings) => $bookings
                    ->whereIn('status', BookingStatus::availabilityBlockingValues())
                    ->where('time_slot', '<=', now())
                    ->where('ends_at', '>', now()),
            ])
            ->when($query->branchId !== null, fn ($builder) => $builder->where('branch_id', $query->branchId))
            ->paginate($query->perPage);
    }
}
