<?php

declare(strict_types=1);

namespace Modules\Chair\Eloquent\Resolvers\Shared;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Chair\CQRS\Query\Shared\ListChairsQuery;
use Modules\Chair\Models\ChairModel;

final class ListChairsEloquentResolver
{
    public function resolve(ListChairsQuery $payload): LengthAwarePaginator
    {
        $now = now();
        $availabilityEnd = $now->copy()->addSecond();
        $query = ChairModel::query()->discoverable()->with([
            'branch',
            'barber',
            'bookings' => function (HasMany $bookingQuery) use ($now, $availabilityEnd): void {
                BookingAvailability::apply($bookingQuery->getQuery(), $now, $availabilityEnd);
            },
        ]);

        if ($payload->branchId !== null) {
            $query->where('branch_id', $payload->branchId);
        }

        if ($payload->status !== null) {
            $query->where('status', $payload->status);
        }

        $chairs = $query->paginate($payload->perPage);
        $chairs->getCollection()->each(fn (ChairModel $chair) => $chair->concealUndiscoverableBarber());

        return $chairs;
    }
}
