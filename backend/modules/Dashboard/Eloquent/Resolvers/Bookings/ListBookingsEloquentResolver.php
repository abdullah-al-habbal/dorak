<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Bookings;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Dashboard\CQRS\Query\ListBookingsQuery;

final class ListBookingsEloquentResolver
{
    private const string DATE_ONLY_PATTERN = '/^\d{4}-\d{2}-\d{2}$/';

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
            ->when(isset($filters['date_to']), fn ($builder) => $builder->where('starts_at', '<=', $this->upperBound((string) $filters['date_to'])))
            ->when(isset($filters['search']), fn ($builder) => $builder->whereHas(
                'client',
                // MySQL compares the extracted JSON text case-sensitively, so lower both sides.
                fn ($client) => $client->where(
                    fn ($name) => $name->whereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(`name`, \'$.en\'))) like ?', ['%'.mb_strtolower((string) $filters['search']).'%'])
                        ->orWhereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(`name`, \'$.ar\'))) like ?', ['%'.mb_strtolower((string) $filters['search']).'%']),
                ),
            ))
            ->latest('starts_at')->paginate((int) ($filters['per_page'] ?? 15));
    }

    /** A date-only `date_to` includes that whole day; a value with a time keeps its exact instant. */
    private function upperBound(string $dateTo): Carbon
    {
        $bound = Carbon::parse($dateTo);

        return preg_match(self::DATE_ONLY_PATTERN, $dateTo) === 1 ? $bound->endOfDay() : $bound;
    }
}
