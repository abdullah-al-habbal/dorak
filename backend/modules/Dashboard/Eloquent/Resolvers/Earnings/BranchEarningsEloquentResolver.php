<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Earnings;

use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Dashboard\CQRS\Query\ShowEarningsQuery;
use Modules\OfferedService\Constants\ServiceOverrideConstants;
use Modules\OfferedService\Queries\BookingServicePricing;

/** Gross revenue, platform commission and net revenue of completed bookings in a set of branches, per currency. */
final class BranchEarningsEloquentResolver
{
    /** @return list<array{currency_code: string, gross_minor: int, commission_minor: int, net_minor: int, completed_bookings_count: int}> */
    public function resolve(ShowEarningsQuery $query): array
    {
        $bookingIds = BookingModel::query()
            ->forBranches($query->branchIds)
            ->where('booking_status', BookingStatus::Completed)
            ->when($query->from, fn ($bookings, $from) => $bookings->where('starts_at', '>=', $from))
            ->when($query->to, fn ($bookings, $to) => $bookings->where('starts_at', '<=', $to))
            ->select('bookings.id');

        $gross = BookingServicePricing::lines($bookingIds)
            ->groupBy('offered_services.currency_code')
            ->selectRaw('offered_services.currency_code as currency_code, SUM('.ServiceOverrideConstants::SERVICE_OVERRIDE_EFFECTIVE_PRICE_SQL.') as gross, COUNT(DISTINCT booking_offered_service.booking_id) as bookings')
            ->get();

        $commission = CommissionEntryModel::query()
            ->whereIn('booking_id', $bookingIds)
            ->groupBy('currency_code')
            ->selectRaw('currency_code, SUM(commission_amount_minor) as total')
            ->pluck('total', 'currency_code');

        return $gross->map(fn (object $row): array => [
            'currency_code' => (string) $row->currency_code,
            'gross_minor' => (int) $row->gross,
            'commission_minor' => (int) ($commission[$row->currency_code] ?? 0),
            'net_minor' => (int) $row->gross - (int) ($commission[$row->currency_code] ?? 0),
            'completed_bookings_count' => (int) $row->bookings,
        ])->sortBy('currency_code')->values()->all();
    }
}
