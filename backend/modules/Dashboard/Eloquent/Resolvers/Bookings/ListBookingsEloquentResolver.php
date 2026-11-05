<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Bookings;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Booking\Enums\BookingStatus;
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
            ->when(isset($filters['booking_status']), fn ($builder) => $builder->where('booking_status', $filters['booking_status']))
            ->when(! empty($filters['hide_cancelled']), fn ($builder) => $builder->where('booking_status', '!=', BookingStatus::Cancelled->value))
            ->when(isset($filters['date_from']), fn ($builder) => $builder->where('starts_at', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($builder) => $builder->where('starts_at', '<=', $filters['date_to']))
            ->when(isset($filters['search']), fn ($builder) => $builder->whereHas(
                'client',
                fn ($client) => $client->where(
                    fn ($name) => $name->where('name->en', 'like', "%{$filters['search']}%")
                        ->orWhere('name->ar', 'like', "%{$filters['search']}%"),
                ),
            ))
            ->latest('starts_at')->paginate((int) ($filters['per_page'] ?? 15));
    }
}
