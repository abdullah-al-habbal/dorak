<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Illuminate\Support\Facades\DB;
use Modules\Booking\Enums\BookingStatus;
use Modules\Subscription\Enums\SubscriptionStatus;

/** Platform-wide monetization figures for the admin overview (Task 65). All money is minor units per currency. */
final class PlatformAnalyticsQuery
{
    /** @return array<string, mixed> */
    public function overview(): array
    {
        return [
            'subscriptions' => $this->subscriptions(),
            'commission' => $this->commission(),
            'payouts' => $this->payouts(),
            'completed_bookings' => DB::table('bookings')->where('status', BookingStatus::Completed->value)->count(),
        ];
    }

    /** @return array{by_plan: list<array<string, mixed>>, recurring_revenue: list<array<string, mixed>>} */
    private function subscriptions(): array
    {
        $live = [SubscriptionStatus::Active->value, SubscriptionStatus::PastDue->value];
        $base = DB::table('brand_subscriptions')
            ->join('subscription_plans', 'subscription_plans.id', '=', 'brand_subscriptions.plan_id')
            ->whereIn('brand_subscriptions.status', $live);

        return [
            'by_plan' => (clone $base)
                ->groupBy('subscription_plans.id')
                ->get(['subscription_plans.id as plan_id', DB::raw('count(*) as subscriptions')])
                ->map(fn ($row): array => ['plan_id' => $row->plan_id, 'subscriptions' => (int) $row->subscriptions])
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
    private function commission(): array
    {
        $totals = fn (bool $settled): array => DB::table('commission_entries')
            ->join('currencies', 'currencies.code', '=', 'commission_entries.currency_code')
            ->when($settled, fn ($q) => $q->whereNotNull('payout_id'), fn ($q) => $q->whereNull('payout_id'))
            ->groupBy('currencies.code')
            ->get(['currencies.code as currency', DB::raw('sum(commission_amount_minor) as total_amount_minor')])
            ->map(fn ($row): array => ['currency' => $row->currency, 'total_amount_minor' => (int) $row->total_amount_minor])
            ->all();

        return ['pending' => $totals(false), 'settled' => $totals(true)];
    }

    /** @return list<array<string, mixed>> */
    private function payouts(): array
    {
        return DB::table('payouts')
            ->join('currencies', 'currencies.code', '=', 'payouts.currency_code')
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
