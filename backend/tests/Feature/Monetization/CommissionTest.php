<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Commission\Enums\CommissionScope;
use Modules\Commission\Enums\CommissionType;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Commission\Models\CommissionRuleModel;
use Modules\Commission\Services\CommissionRuleResolver;
use Modules\Commission\Support\MinorUnits;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\Payout\Models\PayoutModel;

function completeBookingWithPrice(float $price, ?BranchModel $branch = null, ?CurrencyModel $currency = null): BookingModel
{
    $booking = BookingModel::factory()->create(
        $branch === null ? [] : ['branch_id' => $branch->id],
    );
    $service = OfferedServiceModel::factory()->create(array_filter([
        'price' => $price,
        'currency_code' => $currency?->code,
    ]));
    $booking->services()->attach($service->id);
    $booking->update(['status' => BookingStatus::Completed]);

    return $booking;
}

describe('Commission rules API', function (): void {
    beforeEach(function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
    });

    it('creates a global percent rule', function (): void {
        $this->postJson('/api/v1/dashboard/admin/commission-rules', [
            'scope' => 'global', 'type' => 'percent', 'value_bps' => 1250, 'is_active' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('data.scope', 'global')
            ->assertJsonPath('data.value_bps', 1250);
    });

    it('creates brand and branch overrides and a flat fee with a currency', function (): void {
        $brand = BrandModel::factory()->create();
        $branch = BranchModel::factory()->create();
        $currency = CurrencyModel::factory()->create();

        $this->postJson('/api/v1/dashboard/admin/commission-rules', [
            'scope' => 'brand', 'scope_id' => $brand->id, 'type' => 'percent', 'value_bps' => 500, 'is_active' => true,
        ])->assertCreated();
        $this->postJson('/api/v1/dashboard/admin/commission-rules', [
            'scope' => 'branch', 'scope_id' => $branch->id, 'type' => 'flat', 'value_amount_minor' => 300,
            'currency_code' => $currency->code, 'is_active' => true,
        ])->assertCreated()->assertJsonPath('data.currency.code', $currency->code);
    });

    it('validates scope, ids, percent bounds and flat currency', function (): void {
        $url = '/api/v1/dashboard/admin/commission-rules';
        $ok = ['scope' => 'global', 'type' => 'percent', 'value_bps' => 100, 'is_active' => true];

        $this->postJson($url, [])->assertUnprocessable();
        $this->postJson($url, [...$ok, 'scope' => 'brand'])->assertUnprocessable();
        $this->postJson($url, [...$ok, 'scope' => 'brand', 'scope_id' => fake()->uuid()])->assertUnprocessable();
        $this->postJson($url, [...$ok, 'scope_id' => fake()->uuid()])->assertUnprocessable();
        $this->postJson($url, [...$ok, 'value_bps' => 10001])->assertUnprocessable();
        $this->postJson($url, [...$ok, 'value_bps' => 0])->assertUnprocessable();
        $this->postJson($url, [...$ok, 'type' => 'flat'])->assertUnprocessable();
    });

    it('lists, updates and deletes a rule', function (): void {
        $rule = CommissionRuleModel::factory()->create();

        $this->getJson('/api/v1/dashboard/admin/commission-rules')->assertOk()->assertJsonCount(1, 'data');
        $this->putJson("/api/v1/dashboard/admin/commission-rules/{$rule->id}", [
            'scope' => 'global', 'type' => 'percent', 'value_bps' => 2000, 'is_active' => false, 'notes' => 'paused',
        ])->assertOk()->assertJsonPath('data.value_bps', 2000)->assertJsonPath('data.is_active', false);
        $this->deleteJson("/api/v1/dashboard/admin/commission-rules/{$rule->id}")->assertOk();

        expect(CommissionRuleModel::query()->count())->toBe(0);
    });
});

describe('Commission resolution', function (): void {
    it('prefers branch over brand over global', function (): void {
        $branch = BranchModel::factory()->create();
        $currency = CurrencyModel::factory()->create();
        $global = CommissionRuleModel::factory()->create(['value_bps' => 100]);
        $brand = CommissionRuleModel::factory()->create(['scope' => CommissionScope::Brand, 'scope_id' => $branch->brand_id, 'value_bps' => 200]);
        $resolver = app(CommissionRuleResolver::class);

        expect($resolver->resolve($branch->id, $branch->brand_id, $currency->id)->id)->toBe($brand->id);

        $branchRule = CommissionRuleModel::factory()->create(['scope' => CommissionScope::Branch, 'scope_id' => $branch->id, 'value_bps' => 300]);
        expect($resolver->resolve($branch->id, $branch->brand_id, $currency->id)->id)->toBe($branchRule->id);

        $branchRule->update(['is_active' => false]);
        $brand->update(['is_active' => false]);
        expect($resolver->resolve($branch->id, $branch->brand_id, $currency->id)->id)->toBe($global->id);
    });

    it('ignores overrides that belong to other brands and flat rules in another currency', function (): void {
        $branch = BranchModel::factory()->create();
        $currency = CurrencyModel::factory()->create();
        CommissionRuleModel::factory()->create(['scope' => CommissionScope::Brand, 'scope_id' => BrandModel::factory()->create()->id]);
        CommissionRuleModel::factory()->create([
            'type' => CommissionType::Flat, 'value_bps' => null, 'value_amount_minor' => 500, 'currency_code' => CurrencyModel::factory()->create()->code,
        ]);

        expect(app(CommissionRuleResolver::class)->resolve($branch->id, $branch->brand_id, $currency->id))->toBeNull();
    });

    it('converts decimal prices to minor units', function (): void {
        expect(MinorUnits::fromDecimal(12.5))->toBe(1250)
            ->and(MinorUnits::fromDecimal('0.07'))->toBe(7)
            ->and(MinorUnits::fromDecimal(100))->toBe(10000);
    });
});

describe('Commission accrual on completed bookings', function (): void {
    it('records a percent commission once per completed booking', function (): void {
        CommissionRuleModel::factory()->create(['value_bps' => 1000]);
        $booking = completeBookingWithPrice(150.50);

        $entry = CommissionEntryModel::query()->sole();
        expect($entry->booking_id)->toBe($booking->id)
            ->and($entry->base_amount_minor)->toBe(15050)
            ->and($entry->commission_amount_minor)->toBe(1505)
            ->and($entry->rule_snapshot)->toMatchArray(['scope' => 'global', 'type' => 'percent', 'value_bps' => 1000]);

        $booking->touch();
        $booking->update(['status' => BookingStatus::Completed]);
        expect(CommissionEntryModel::query()->count())->toBe(1);
    });

    it('records a flat fee from a branch override', function (): void {
        $branch = BranchModel::factory()->create();
        $currency = CurrencyModel::factory()->create();
        CommissionRuleModel::factory()->create(['value_bps' => 1000]);
        CommissionRuleModel::factory()->create([
            'scope' => CommissionScope::Branch, 'scope_id' => $branch->id,
            'type' => CommissionType::Flat, 'value_bps' => null, 'value_amount_minor' => 250, 'currency_code' => $currency->code,
        ]);

        completeBookingWithPrice(40, $branch, $currency);

        expect(CommissionEntryModel::query()->sole()->commission_amount_minor)->toBe(250);
    });

    it('accrues nothing without a rule, or for a booking that is not completed', function (): void {
        completeBookingWithPrice(100);
        expect(CommissionEntryModel::query()->count())->toBe(0);

        CommissionRuleModel::factory()->create();
        $pending = BookingModel::factory()->create();
        $pending->services()->attach(OfferedServiceModel::factory()->create(['price' => 100])->id);
        $pending->update(['status' => BookingStatus::InProgress]);

        expect(CommissionEntryModel::query()->count())->toBe(0);
    });

    it('accrues nothing for a booking without services or without a branch', function (): void {
        CommissionRuleModel::factory()->create();
        $empty = BookingModel::factory()->create();
        $empty->update(['status' => BookingStatus::Completed]);

        $freelance = BookingModel::factory()->create(['chair_id' => null, 'branch_id' => null]);
        $freelance->services()->attach(OfferedServiceModel::factory()->create(['price' => 100])->id);
        $freelance->update(['status' => BookingStatus::Completed]);

        expect(CommissionEntryModel::query()->count())->toBe(0);
    });

    it('lists entries filtered by brand and settlement', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $open = CommissionEntryModel::factory()->create();
        $payoutEntry = CommissionEntryModel::factory()->create([
            'payout_id' => PayoutModel::factory()->create()->id,
        ]);

        $this->getJson('/api/v1/dashboard/admin/commission-entries')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/dashboard/admin/commission-entries?settled=0')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $open->id);
        $this->getJson('/api/v1/dashboard/admin/commission-entries?settled=1')->assertOk()->assertJsonPath('data.0.id', $payoutEntry->id);
        $this->getJson("/api/v1/dashboard/admin/commission-entries?brand_id={$open->brand_id}")->assertOk()->assertJsonCount(1, 'data');
    });
});
