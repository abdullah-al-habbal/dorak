<?php

declare(strict_types=1);

namespace Modules\OfferedService\Queries;

use Illuminate\Contracts\Database\Query\Builder as BuilderContract;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Facades\DB;

/**
 * The services booked on a set of bookings, joined to the override their
 * branch's brand set (Gap G6). Select `SERVICE_OVERRIDE_EFFECTIVE_PRICE_SQL`
 * for the price a brand actually charges.
 */
final class BookingServicePricing
{
    /** @param  BuilderContract  $bookingIds  a query selecting `bookings.id` */
    public static function lines(BuilderContract $bookingIds): Builder
    {
        return DB::table('booking_offered_service')
            ->join('offered_services', 'offered_services.id', '=', 'booking_offered_service.offered_service_id')
            ->join('bookings', 'bookings.id', '=', 'booking_offered_service.booking_id')
            ->leftJoin('chairs', 'chairs.id', '=', 'bookings.chair_id')
            ->leftJoin('branches', fn (JoinClause $join) => $join->whereRaw('branches.id = COALESCE(bookings.branch_id, chairs.branch_id)'))
            ->leftJoin('barber_service_overrides', fn (JoinClause $join) => $join
                ->on('barber_service_overrides.offered_service_id', '=', 'offered_services.id')
                ->on('barber_service_overrides.brand_id', '=', 'branches.brand_id'))
            ->whereIn('booking_offered_service.booking_id', $bookingIds);
    }
}
