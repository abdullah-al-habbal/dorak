<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Earnings;

use Illuminate\Support\Collection;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Constants\DashboardEarningsConstants;
use Modules\Dashboard\CQRS\Query\ShowEarningsQuery;
use Modules\OfferedService\Services\EffectiveServiceTerms;

/**
 * A stylist's personal gross revenue from their own completed bookings, per
 * currency. Net pay is reported only for a currency whose every booking falls
 * under an active branch/brand affiliation with a commission percent
 * (the percent is the affiliation's deduction from the gross).
 */
final class BarberEarningsEloquentResolver
{
    public function __construct(private readonly EffectiveServiceTerms $serviceTerms) {}

    /** @return list<array{currency_code: string, gross_minor: int, net_minor: int|null, completed_bookings_count: int}> */
    public function resolve(ShowEarningsQuery $query): array
    {
        $bookings = BookingModel::query()
            ->with(['services:id,price_amount_minor,currency_code', 'chair:id,branch_id'])
            ->where('barber_id', $query->actorId)
            ->where('booking_status', BookingStatus::Completed)
            ->when($query->from, fn ($builder, $from) => $builder->where('starts_at', '>=', $from))
            ->when($query->to, fn ($builder, $to) => $builder->where('starts_at', '<=', $to))
            ->get();

        $percentByBranch = $this->percentByBranch($query->actorId, $bookings);
        $prices = $this->serviceTerms->priceOverridesFor($bookings);
        $totals = [];

        foreach ($bookings as $booking) {
            $branchId = (string) ($booking->branch_id ?? $booking->chair?->branch_id);
            $percent = $percentByBranch[$branchId] ?? null;

            foreach ($booking->services->groupBy('currency_code') as $currency => $services) {
                $gross = (int) $services->sum(fn ($service): int => $prices[$branchId][$service->getKey()] ?? (int) $service->price_amount_minor);
                $row = $totals[$currency] ?? ['gross' => 0, 'net' => 0, 'covered' => true, 'ids' => []];
                $row['gross'] += $gross;
                $row['ids'][$booking->getKey()] = true;
                $percent === null
                    ? $row['covered'] = false
                    : $row['net'] += (int) round($gross * (DashboardEarningsConstants::DASHBOARD_EARNINGS_PERCENT_DENOMINATOR - $percent) / DashboardEarningsConstants::DASHBOARD_EARNINGS_PERCENT_DENOMINATOR);
                $totals[$currency] = $row;
            }
        }

        ksort($totals);

        return collect($totals)->map(fn (array $row, string $currency): array => [
            'currency_code' => $currency,
            'gross_minor' => $row['gross'],
            'net_minor' => $row['covered'] ? $row['net'] : null,
            'completed_bookings_count' => count($row['ids']),
        ])->values()->all();
    }

    /**
     * Commission percent per branch id from the barber's active affiliations
     * (a branch affiliation wins over its brand's).
     *
     * @param  Collection<int, BookingModel>  $bookings
     * @return array<string, float>
     */
    private function percentByBranch(string $barberId, Collection $bookings): array
    {
        $branchIds = $bookings->map(fn (BookingModel $booking) => $booking->branch_id ?? $booking->chair?->branch_id)->filter()->unique()->values();

        if ($branchIds->isEmpty()) {
            return [];
        }

        $brandByBranch = BranchModel::query()->whereIn('id', $branchIds)->pluck('brand_id', 'id');
        $affiliations = BarberAffiliationModel::query()
            ->where('barber_id', $barberId)
            ->where('status', AffiliationStatus::Active)
            ->whereNotNull('commission_percent')
            ->get();

        $percents = [];
        foreach ($branchIds as $branchId) {
            $match = $affiliations->first(fn (BarberAffiliationModel $a) => $a->affiliable_type === AffiliableType::Branch && (string) $a->affiliable_id === (string) $branchId)
                ?? $affiliations->first(fn (BarberAffiliationModel $a) => $a->affiliable_type === AffiliableType::Brand && (string) $a->affiliable_id === (string) $brandByBranch[$branchId]);

            if ($match !== null) {
                $percents[(string) $branchId] = (float) $match->commission_percent;
            }
        }

        return $percents;
    }
}
