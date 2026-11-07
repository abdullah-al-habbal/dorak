<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Schedule;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Booking\Models\BookingModel;
use Modules\Dashboard\CQRS\Query\ListScheduleAppointmentsQuery;

final class ListScheduleAppointmentsEloquentResolver
{
    /** The barber's own bookings, earliest first (a schedule reads forward in time). */
    public function resolve(ListScheduleAppointmentsQuery $query): LengthAwarePaginator
    {
        return BookingModel::query()
            ->where('barber_id', $query->barberId)
            ->when($query->status !== null, fn ($builder) => $builder->where('booking_status', $query->status?->value))
            ->when($query->dateFrom !== null, fn ($builder) => $builder->whereDate('starts_at', '>=', $query->dateFrom))
            ->when($query->dateTo !== null, fn ($builder) => $builder->whereDate('starts_at', '<=', $query->dateTo))
            ->with(['chair', 'client' => fn ($client) => $client->withReputation(), 'services'])
            ->orderBy('starts_at')
            ->paginate($query->perPage);
    }
}
