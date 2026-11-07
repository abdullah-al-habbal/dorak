<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Booking\Models\BookingModel;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Payout\Models\PayoutModel;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;

describe('Platform analytics overview', function (): void {
    it('is empty on a fresh platform', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson('/api/v1/dashboard/admin/analytics/overview')
            ->assertOk()
            ->assertJsonPath('data.subscriptions.by_plan', [])
            ->assertJsonPath('data.commission.pending', [])
            ->assertJsonPath('data.payouts', [])
            ->assertJsonPath('data.completed_bookings', 0);
    });

    it('aggregates subscriptions, commission and payouts per currency', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $currency = CurrencyModel::factory()->create();
        $plan = SubscriptionPlanModel::factory()->create(['price_amount_minor' => 5000, 'currency_code' => $currency->code]);
        BrandSubscriptionModel::factory()->count(2)->create(['plan_id' => $plan->id]);
        BrandSubscriptionModel::factory()->create(['plan_id' => $plan->id, 'status' => SubscriptionStatus::Cancelled]);
        CommissionEntryModel::factory()->create(['currency_code' => $currency->code, 'commission_amount_minor' => 400]);
        $payout = PayoutModel::factory()->create(['currency_code' => $currency->code, 'total_amount_minor' => 900, 'status' => PayoutStatus::Paid]);
        CommissionEntryModel::factory()->create(['currency_code' => $currency->code, 'commission_amount_minor' => 900, 'payout_id' => $payout->id]);
        BookingModel::factory()->completed()->create();

        $this->getJson('/api/v1/dashboard/admin/analytics/overview')
            ->assertOk()
            ->assertJsonPath('data.subscriptions.by_plan.0.plan_id', $plan->id)
            ->assertJsonPath('data.subscriptions.by_plan.0.subscriptions', 2)
            ->assertJsonPath('data.subscriptions.recurring_revenue.0.total_amount_minor', 10000)
            ->assertJsonPath('data.subscriptions.recurring_revenue.0.currency', $currency->code)
            ->assertJsonPath('data.commission.pending.0.total_amount_minor', 400)
            ->assertJsonPath('data.commission.settled.0.total_amount_minor', 900)
            ->assertJsonPath('data.payouts.0.status', 'paid')
            ->assertJsonPath('data.payouts.0.total_amount_minor', 900)
            ->assertJsonPath('data.completed_bookings', 1);
    });

    it('narrows the flow figures to the requested range and keeps snapshots live', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        BookingModel::factory()->completed()->create(['starts_at' => '2026-03-10 10:00:00']);
        BookingModel::factory()->completed()->create(['starts_at' => '2026-03-10 15:00:00']);
        BookingModel::factory()->completed()->create(['starts_at' => '2026-04-20 10:00:00']);
        BookingModel::factory()->cancelled()->create(['starts_at' => '2026-03-11 10:00:00']);

        $this->getJson('/api/v1/dashboard/admin/analytics/overview?from=2026-03-01&to=2026-03-31')
            ->assertOk()
            ->assertJsonPath('data.period', ['from' => '2026-03-01', 'to' => '2026-03-31'])
            ->assertJsonPath('data.completed_bookings', 2)
            ->assertJsonPath('data.completed_bookings_series', [['date' => '2026-03-10', 'count' => 2]])
            ->assertJsonFragment(['status' => 'cancelled', 'count' => 1])
            ->assertJsonFragment(['status' => 'completed', 'count' => 2]);

        $this->getJson('/api/v1/dashboard/admin/analytics/overview')
            ->assertOk()
            ->assertJsonPath('data.period', ['from' => null, 'to' => null])
            ->assertJsonPath('data.completed_bookings', 3);
    });

    it('names each plan and counts the platform totals', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $plan = SubscriptionPlanModel::factory()->create();
        BrandSubscriptionModel::factory()->create(['plan_id' => $plan->id]);

        $this->getJson('/api/v1/dashboard/admin/analytics/overview')
            ->assertOk()
            ->assertJsonPath('data.subscriptions.by_plan.0.plan_name', (string) $plan->name)
            ->assertJsonStructure(['data' => ['platform' => ['brands', 'branches', 'barbers', 'clients']]]);
    });

    it('filters commission and payouts by creation date', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $currency = CurrencyModel::factory()->create();
        CommissionEntryModel::factory()->create(['currency_code' => $currency->code, 'commission_amount_minor' => 300, 'created_at' => '2026-03-05 09:00:00']);
        CommissionEntryModel::factory()->create(['currency_code' => $currency->code, 'commission_amount_minor' => 700, 'created_at' => '2026-05-05 09:00:00']);

        $this->getJson('/api/v1/dashboard/admin/analytics/overview?from=2026-03-01&to=2026-03-31')
            ->assertOk()
            ->assertJsonPath('data.commission.pending.0.total_amount_minor', 300);
    });

    it('rejects a reversed or malformed range', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson('/api/v1/dashboard/admin/analytics/overview?from=2026-04-01&to=2026-03-01')->assertUnprocessable();
        $this->getJson('/api/v1/dashboard/admin/analytics/overview?from=soon')->assertUnprocessable();
    });
});
