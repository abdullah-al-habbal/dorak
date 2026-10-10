<?php

declare(strict_types=1);

namespace Modules\Chair\Eloquent\Resolvers\Shared;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Booking\Enums\BookingStatus;
use Modules\Chair\CQRS\Query\Shared\ListChairsQuery;
use Modules\Chair\Models\ChairModel;

final class ListChairsEloquentResolver
{
    public function resolve(ListChairsQuery $payload): LengthAwarePaginator
    {
        $query = ChairModel::with([
            'branch',
            'barber',
            'bookings' => fn (HasMany $bookingQuery) => $bookingQuery
                ->where('status', BookingStatus::Confirmed)
                ->where('time_slot', '<=', now())
                ->where('ends_at', '>', now()),
        ]);

        if ($payload->branchId !== null) {
            $query->where('branch_id', $payload->branchId);
        }

        if ($payload->status !== null) {
            $query->where('status', $payload->status);
        }

        return $query->paginate($payload->perPage);
    }
}
