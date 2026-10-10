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
            ->when($query->branchId !== null, fn ($builder) => $builder->whereHas('chair', fn ($chair) => $chair->where('branch_id', $query->branchId)))
            ->firstOrFail();
    }
}
