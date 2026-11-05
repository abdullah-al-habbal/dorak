<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Earnings;

use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Dashboard\CQRS\Query\ShowEarningsQuery;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\OfferedService\Constants\ServiceOverrideConstants;
use Modules\OfferedService\Queries\BookingServicePricing;

/**
 * Gross revenue and completed bookings per calendar day and currency, for the
 * same bookings the totals cover (a stylist's own, or the actor's branches).
 * Days come from the stored booking time (UTC), the same clock the range filter uses.
 */
final class EarningsSeriesEloquentResolver
{
    /** @return list<array{date: string, currency_code: string, gross_minor: int, completed_bookings_count: int}> */
    public function resolve(ShowEarningsQuery $query): array
    {
        $bookingIds = BookingModel::query()
            ->when(
                $query->actorType === DashboardActorTypeEnum::Barber,
                fn ($bookings) => $bookings->where('barber_id', $query->actorId),
                fn ($bookings) => $bookings->forBranches($query->branchIds),
            )
            ->where('booking_status', BookingStatus::Completed)
            ->when($query->from, fn ($bookings, $from) => $bookings->where('starts_at', '>=', $from))
            ->when($query->to, fn ($bookings, $to) => $bookings->where('starts_at', '<=', $to))
            ->select('bookings.id');

        return BookingServicePricing::lines($bookingIds)
            ->groupByRaw('DATE(bookings.starts_at), offered_services.currency_code')
            ->orderByRaw('DATE(bookings.starts_at), offered_services.currency_code')
            ->selectRaw('DATE(bookings.starts_at) as day, offered_services.currency_code as currency_code, SUM('.ServiceOverrideConstants::SERVICE_OVERRIDE_EFFECTIVE_PRICE_SQL.') as gross, COUNT(DISTINCT booking_offered_service.booking_id) as bookings')
            ->get()
            ->map(fn (object $row): array => [
                'date' => (string) $row->day,
                'currency_code' => (string) $row->currency_code,
                'gross_minor' => (int) $row->gross,
                'completed_bookings_count' => (int) $row->bookings,
            ])->all();
    }
}
