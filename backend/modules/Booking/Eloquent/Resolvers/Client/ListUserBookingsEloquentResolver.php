<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Client;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Booking\CQRS\Query\Client\ListUserBookingsQuery;
use Modules\Booking\Enums\BookingFilterStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;

final class ListUserBookingsEloquentResolver
{
    public function resolve(ListUserBookingsQuery $query): LengthAwarePaginator
    {
        $now = Carbon::now();

        $queryBuilder = BookingModel::where('client_id', $query->clientId)
            ->with(['chair.barber', 'barber', 'services']);

        if ($query->filterStatus === null) {
            return $queryBuilder->orderBy('starts_at', 'desc')->paginate($query->perPage);
        }

        return match ($query->filterStatus) {
            BookingFilterStatus::Upcoming => $queryBuilder
                ->where(function (Builder $q) use ($now): void {
                    $q->where('booking_status', BookingStatus::InProgress)
                        ->orWhere(function (Builder $open) use ($now): void {
                            $open->whereIn('booking_status', [BookingStatus::Pending, BookingStatus::Confirmed])
                                ->where('ends_at', '>=', $now);
                        });
                })
                ->orderBy('starts_at')
                ->paginate($query->perPage),
            BookingFilterStatus::Past => $queryBuilder
                ->where(function (Builder $q) use ($now): void {
                    $q->whereIn('booking_status', [BookingStatus::Completed, BookingStatus::Cancelled, BookingStatus::NoShow])
                        ->orWhere(function (Builder $lapsed) use ($now): void {
                            $lapsed->whereIn('booking_status', [BookingStatus::Pending, BookingStatus::Confirmed])
                                ->where('ends_at', '<', $now);
                        });
                })
                ->orderBy('starts_at', 'desc')
                ->paginate($query->perPage),
        };
    }
}
