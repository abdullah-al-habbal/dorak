<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Bookings;

use Modules\Booking\Models\BookingModel;
use Modules\Dashboard\CQRS\Query\ShowBookingQuery;

final class ShowBookingEloquentResolver
{
    public function resolve(ShowBookingQuery $query): BookingModel
    {
        return BookingModel::query()->with(['chair', 'barber', 'client', 'services'])
            ->whereKey($query->bookingId)
            ->when($query->branchIds !== null, fn ($builder) => $builder->forBranches($query->branchIds))
            ->firstOrFail();
    }
}
