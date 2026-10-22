<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Bookings;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Booking\Models\BookingModel;
use Modules\Dashboard\CQRS\Query\ListBookingsQuery;

final class ListBookingsEloquentResolver
{
    public function resolve(ListBookingsQuery $query): LengthAwarePaginator
    {
        $filters = $query->filters;

        return BookingModel::query()->with(['chair', 'barber', 'client' => fn ($query) => $query->withReputation(), 'services'])
            ->when($query->branchIds !== null, fn ($builder) => $builder->forBranches($query->branchIds))
            ->when(isset($filters['chair_id']), fn ($builder) => $builder->where('chair_id', $filters['chair_id']))
            ->when(isset($filters['stylist_id']), fn ($builder) => $builder->where('barber_id', $filters['stylist_id']))
            ->when(isset($filters['status']), fn ($builder) => $builder->where('status', $filters['status']))
            ->when(isset($filters['date_from']), fn ($builder) => $builder->where('time_slot', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($builder) => $builder->where('time_slot', '<=', $filters['date_to']))
            ->latest('time_slot')->paginate((int) ($filters['per_page'] ?? 15));
    }
}
