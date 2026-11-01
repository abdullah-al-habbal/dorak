<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Brand\Models\BrandModel;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Payout\Models\PayoutModel;

describe('Payout generation', function (): void {
    beforeEach(function (): void {
        $this->admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($this->admin);
    });

    it('groups unsettled entries into one draft per brand and currency', function (): void {
        $brand = BrandModel::factory()->create();
        $other = BrandModel::factory()->create();
        $currency = CurrencyModel::factory()->create();
        CommissionEntryModel::factory()->count(2)->create(['brand_id' => $brand->id, 'currency_id' => $currency->id, 'commission_minor' => 700]);
        CommissionEntryModel::factory()->create(['brand_id' => $other->id, 'currency_id' => $currency->id, 'commission_minor' => 300]);
        $settled = CommissionEntryModel::factory()->create([
            'brand_id' => $brand->id, 'currency_id' => $currency->id, 'payout_id' => PayoutModel::factory()->create()->id,
        ]);

        $response = $this->postJson('/api/v1/dashboard/admin/payouts/generate')->assertCreated();

        expect($response->json('data'))->toHaveCount(2);
        $payout = PayoutModel::query()->where('brand_id', $brand->id)->where('currency_id', $currency->id)->sole();
        expect($payout->total_minor)->toBe(1400)
            ->and($payout->status)->toBe(PayoutStatus::Draft)
            ->and($payout->entries()->count())->toBe(2)
            ->and($settled->fresh()->payout_id)->not->toBe($payout->id);
    });

    it('creates nothing when every entry is already settled', function (): void {
        $this->postJson('/api/v1/dashboard/admin/payouts/generate')->assertCreated()->assertJsonCount(0, 'data');

        expect(PayoutModel::query()->count())->toBe(0);
    });

    it('is also runnable from the console', function (): void {
        CommissionEntryModel::factory()->create();

        $this->artisan('payouts:generate')->expectsOutput('1 draft payout(s) created.')->assertSuccessful();
    });
});

describe('Payout lifecycle', function (): void {
    beforeEach(function (): void {
        $this->admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($this->admin);
    });

    it('lists, filters and shows payouts', function (): void {
        $draft = PayoutModel::factory()->create();
        PayoutModel::factory()->create(['status' => PayoutStatus::Paid]);

        $this->getJson('/api/v1/dashboard/admin/payouts')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/dashboard/admin/payouts?status=draft')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/v1/dashboard/admin/payouts?brand_id={$draft->brand_id}")->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/dashboard/admin/payouts?status=bogus')->assertUnprocessable();
        $this->getJson("/api/v1/dashboard/admin/payouts/{$draft->id}")->assertOk()->assertJsonPath('data.status', PayoutStatus::Draft->value);
    });

    it('approves then pays a payout, recording the approver and reference', function (): void {
        $payout = PayoutModel::factory()->create();

        $this->patchJson("/api/v1/dashboard/admin/payouts/{$payout->id}/approve", ['notes' => 'ok'])
            ->assertOk()
            ->assertJsonPath('data.status', PayoutStatus::Approved->value);
        expect($payout->fresh()->approved_by)->toBe($this->admin->id);

        $this->patchJson("/api/v1/dashboard/admin/payouts/{$payout->id}/mark-paid", ['reference' => 'TX-9'])
            ->assertOk()
            ->assertJsonPath('data.status', PayoutStatus::Paid->value)
            ->assertJsonPath('data.reference', 'TX-9');
        expect($payout->fresh()->paid_at)->not->toBeNull();
    });

    it('rejects illegal transitions', function (): void {
        $draft = PayoutModel::factory()->create();
        $paid = PayoutModel::factory()->create(['status' => PayoutStatus::Paid]);
        $canceled = PayoutModel::factory()->create(['status' => PayoutStatus::Canceled]);

        $this->patchJson("/api/v1/dashboard/admin/payouts/{$draft->id}/mark-paid")->assertConflict();
        $this->patchJson("/api/v1/dashboard/admin/payouts/{$paid->id}/cancel")->assertConflict();
        $this->patchJson("/api/v1/dashboard/admin/payouts/{$paid->id}/approve")->assertConflict();
        $this->patchJson("/api/v1/dashboard/admin/payouts/{$canceled->id}/approve")->assertConflict();
        $this->patchJson("/api/v1/dashboard/admin/payouts/{$draft->id}/approve", ['reference' => str_repeat('x', 300)])->assertUnprocessable();
    });

    it('canceling releases the entries so the next run picks them up again', function (): void {
        $payout = PayoutModel::factory()->create();
        $entry = CommissionEntryModel::factory()->create(['payout_id' => $payout->id, 'brand_id' => $payout->brand_id, 'currency_id' => $payout->currency_id]);

        $this->patchJson("/api/v1/dashboard/admin/payouts/{$payout->id}/cancel")->assertOk()->assertJsonPath('data.status', PayoutStatus::Canceled->value);

        expect($entry->fresh()->payout_id)->toBeNull();
        $this->postJson('/api/v1/dashboard/admin/payouts/generate')->assertCreated()->assertJsonCount(1, 'data');
    });

    it('can cancel an approved payout', function (): void {
        $payout = PayoutModel::factory()->create(['status' => PayoutStatus::Approved]);

        $this->patchJson("/api/v1/dashboard/admin/payouts/{$payout->id}/cancel")->assertOk();
    });
});
