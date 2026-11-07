<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Carbon\CarbonInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\SubscriptionPlanModel;

/**
 * Platform-wide figures for the admin analytics screen. All money is minor units per currency.
 * The optional range narrows the flow figures (bookings, commission, payouts); subscriptions and
 * the platform totals are always a live snapshot.
 */
final class PlatformAnalyticsQuery
{
    /** @return array<string, mixed> */
    public function overview(?CarbonInterface $from = null, ?CarbonInterface $to = null): array
    {
        return [
            'period' => ['from' => $from?->toDateString(), 'to' => $to?->toDateString()],
            'platform' => $this->platform(),
            'subscriptions' => $this->subscriptions(),
            'commission' => $this->commission($from, $to),
            'payouts' => $this->payouts($from, $to),
            'completed_bookings' => $this->bookingsInRange($from, $to)->where('booking_status', BookingStatus::Completed->value)->count(),
            'bookings_by_status' => $this->bookingsByStatus($from, $to),
            'completed_bookings_series' => $this->completedSeries($from, $to),
        ];
    }

    /** @return array{brands: int, branches: int, barbers: int, clients: int} */
    private function platform(): array
    {
        return [
            'brands' => BrandModel::query()->count(),
            'branches' => BranchModel::query()->count(),
            'barbers' => BarberModel::query()->count(),
            'clients' => ClientModel::query()->count(),
        ];
    }

    private function bookingsInRange(?CarbonInterface $from, ?CarbonInterface $to): Builder
    {
        return DB::table('bookings')
            ->when($from, fn (Builder $query, CarbonInterface $value) => $query->where('starts_at', '>=', $value))
            ->when($to, fn (Builder $query, CarbonInterface $value) => $query->where('starts_at', '<=', $value));
    }

    /** @return list<array{status: string, count: int}> */
    private function bookingsByStatus(?CarbonInterface $from, ?CarbonInterface $to): array
    {
        return $this->bookingsInRange($from, $to)
            ->groupBy('booking_status')
            ->orderBy('booking_status')
            ->get(['booking_status', DB::raw('count(*) as total')])
            ->map(fn ($row): array => ['status' => (string) $row->booking_status, 'count' => (int) $row->total])
            ->all();
    }

    /** @return list<array{date: string, count: int}> */
    private function completedSeries(?CarbonInterface $from, ?CarbonInterface $to): array
    {
        return $this->bookingsInRange($from, $to)
            ->where('booking_status', BookingStatus::Completed->value)
            ->groupByRaw('DATE(starts_at)')
            ->orderByRaw('DATE(starts_at)')
            ->get([DB::raw('DATE(starts_at) as day'), DB::raw('count(*) as total')])
            ->map(fn ($row): array => ['date' => (string) $row->day, 'count' => (int) $row->total])
            ->all();
    }

    /** @return array{by_plan: list<array<string, mixed>>, recurring_revenue: list<array<string, mixed>>} */
    private function subscriptions(): array
    {
        $live = [SubscriptionStatus::Active->value, SubscriptionStatus::PastDue->value];
        $base = DB::table('brand_subscriptions')
            ->join('subscription_plans', 'subscription_plans.id', '=', 'brand_subscriptions.plan_id')
            ->whereIn('brand_subscriptions.status', $live);
        $byPlan = (clone $base)
            ->groupBy('subscription_plans.id')
            ->get(['subscription_plans.id as plan_id', DB::raw('count(*) as subscriptions')]);
        $names = SubscriptionPlanModel::withTrashed()->whereIn('id', $byPlan->pluck('plan_id'))->get()->mapWithKeys(fn (SubscriptionPlanModel $plan): array => [$plan->id => (string) $plan->name]);

        return [
            'by_plan' => $byPlan
                ->map(fn ($row): array => ['plan_id' => $row->plan_id, 'plan_name' => $names[$row->plan_id] ?? '', 'subscriptions' => (int) $row->subscriptions])
                ->all(),
            'recurring_revenue' => (clone $base)
                ->join('currencies', 'currencies.code', '=', 'subscription_plans.currency_code')
                ->groupBy('currencies.code')
                ->get(['currencies.code as currency', DB::raw('sum(subscription_plans.price_amount_minor) as total_amount_minor')])
                ->map(fn ($row): array => ['currency' => $row->currency, 'total_amount_minor' => (int) $row->total_amount_minor])
                ->all(),
        ];
    }

    /** @return array{pending: list<array<string, mixed>>, settled: list<array<string, mixed>>} */
    private function commission(?CarbonInterface $from, ?CarbonInterface $to): array
    {
        $totals = fn (bool $settled): array => DB::table('commission_entries')
            ->join('currencies', 'currencies.code', '=', 'commission_entries.currency_code')
            ->when($settled, fn ($q) => $q->whereNotNull('payout_id'), fn ($q) => $q->whereNull('payout_id'))
            ->when($from, fn (Builder $q, CarbonInterface $value) => $q->where('commission_entries.created_at', '>=', $value))
            ->when($to, fn (Builder $q, CarbonInterface $value) => $q->where('commission_entries.created_at', '<=', $value))
            ->groupBy('currencies.code')
            ->get(['currencies.code as currency', DB::raw('sum(commission_amount_minor) as total_amount_minor')])
            ->map(fn ($row): array => ['currency' => $row->currency, 'total_amount_minor' => (int) $row->total_amount_minor])
            ->all();

        return ['pending' => $totals(false), 'settled' => $totals(true)];
    }

    /** @return list<array<string, mixed>> */
    private function payouts(?CarbonInterface $from, ?CarbonInterface $to): array
    {
        return DB::table('payouts')
            ->join('currencies', 'currencies.code', '=', 'payouts.currency_code')
            ->when($from, fn (Builder $q, CarbonInterface $value) => $q->where('payouts.created_at', '>=', $value))
            ->when($to, fn (Builder $q, CarbonInterface $value) => $q->where('payouts.created_at', '<=', $value))
            ->groupBy('payouts.status', 'currencies.code')
            ->get(['payouts.status', 'currencies.code as currency', DB::raw('count(*) as payouts'), DB::raw('sum(total_amount_minor) as total_amount_minor')])
            ->map(fn ($row): array => [
                'status' => $row->status,
                'currency' => $row->currency,
                'payouts' => (int) $row->payouts,
                'total_amount_minor' => (int) $row->total_amount_minor,
            ])
            ->all();
    }
}
