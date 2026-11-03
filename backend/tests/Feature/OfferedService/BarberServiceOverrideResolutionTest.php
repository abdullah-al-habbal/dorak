<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Commission\Models\CommissionRuleModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\BarberServiceOverrideModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\OfferedService\Services\EffectiveServiceTerms;

beforeEach(function (): void {
    $this->currency = CurrencyModel::factory()->create();
    $this->owner = ClientModel::factory()->create();
    $this->brand = BrandModel::factory()->create(['owner_id' => $this->owner->id]);
    $this->branch = BranchModel::factory()->create(['brand_id' => $this->brand->id]);
    $this->otherBranch = BranchModel::factory()->create();
    $this->barber = BarberModel::factory()->create();
    $this->chair = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $this->barber->id]);
    $this->otherChair = ChairModel::factory()->create(['branch_id' => $this->otherBranch->id, 'barber_id' => $this->barber->id]);
    $this->service = OfferedServiceModel::factory()->create([
        'serviceable_type' => ServiceableTypeEnum::Barber,
        'serviceable_id' => $this->barber->id,
        'currency_code' => $this->currency->code,
        'price_amount_minor' => 2000,
        'duration_minutes' => 30,
    ]);
    $this->override = fn (array $attributes = []) => BarberServiceOverrideModel::factory()->create(array_merge([
        'offered_service_id' => $this->service->id,
        'brand_id' => $this->brand->id,
        'price_amount_minor' => 3500,
        'duration_minutes' => 60,
    ], $attributes));
    $this->completedBooking = function (BranchModel $branch, ChairModel $chair): BookingModel {
        $booking = BookingModel::factory()->create([
            'branch_id' => $branch->id,
            'chair_id' => $chair->id,
            'barber_id' => $this->barber->id,
            'booking_status' => BookingStatus::Completed,
            'starts_at' => now(),
        ]);
        $booking->services()->attach($this->service->id);

        return $booking;
    };
});

describe('barber service list', function (): void {
    it('shows the barber default when no branch is given', function (): void {
        ($this->override)();

        $this->getJson('/api/v1/barbers/'.$this->barber->id.'/services')
            ->assertOk()
            ->assertJsonPath('data.0.price_amount_minor', 2000)
            ->assertJsonPath('data.0.duration_minutes', 30)
            ->assertJsonMissingPath('data.0.is_overridden');
    });

    it('shows the override only to the brand that set it', function (): void {
        ($this->override)();

        $this->getJson('/api/v1/barbers/'.$this->barber->id.'/services?branch_id='.$this->branch->id)
            ->assertOk()
            ->assertJsonPath('data.0.price_amount_minor', 3500)
            ->assertJsonPath('data.0.duration_minutes', 60)
            ->assertJsonPath('data.0.is_overridden', true);
        $this->getJson('/api/v1/barbers/'.$this->barber->id.'/services?branch_id='.$this->otherBranch->id)
            ->assertOk()
            ->assertJsonPath('data.0.price_amount_minor', 2000)
            ->assertJsonPath('data.0.duration_minutes', 30)
            ->assertJsonPath('data.0.is_overridden', false);
    });

    it('returns to the default once the override is deleted', function (): void {
        ($this->override)()->delete();

        $this->getJson('/api/v1/barbers/'.$this->barber->id.'/services?branch_id='.$this->branch->id)
            ->assertOk()
            ->assertJsonPath('data.0.price_amount_minor', 2000)
            ->assertJsonPath('data.0.is_overridden', false);
    });

    it('falls back per field when the override sets only one', function (): void {
        ($this->override)(['duration_minutes' => null]);

        $this->getJson('/api/v1/barbers/'.$this->barber->id.'/services?branch_id='.$this->branch->id)
            ->assertOk()
            ->assertJsonPath('data.0.price_amount_minor', 3500)
            ->assertJsonPath('data.0.duration_minutes', 30);
    });

    it('rejects an unknown branch', function (): void {
        $this->getJson('/api/v1/barbers/'.$this->barber->id.'/services?branch_id='.fake()->uuid())->assertUnprocessable();
    });
});

describe('effective terms resolver', function (): void {
    it('ignores overrides on brand-owned services and without a brand', function (): void {
        $brandService = OfferedServiceModel::factory()->create(['serviceable_id' => $this->brand->id, 'price_amount_minor' => 1000]);
        ($this->override)();
        $terms = app(EffectiveServiceTerms::class);

        $terms->attach([$brandService], $this->brand->id);
        $terms->attach([$this->service], null);

        expect($brandService->hasBrandContext())->toBeFalse()
            ->and($brandService->effectivePriceAmountMinor())->toBe(1000)
            ->and($this->service->hasBrandOverride())->toBeFalse()
            ->and($this->service->effectivePriceAmountMinor())->toBe(2000);
    });
});

describe('booking and slot duration', function (): void {
    beforeEach(function (): void {
        $this->actingAs(ClientModel::factory()->create(), 'client');
        $this->slot = Carbon::tomorrow()->startOfDay()->addHours(10);
    });

    it('books a barber service for the override duration at the overriding brand', function (): void {
        ($this->override)();

        $this->postJson('/api/v1/bookings', ['chair_id' => $this->chair->id, 'starts_at' => $this->slot->toIso8601String(), 'service_ids' => [$this->service->id]])
            ->assertCreated()
            ->assertJsonPath('data.services.0.price_amount_minor', 3500)
            ->assertJsonPath('data.services.0.duration_minutes', 60);

        $booking = BookingModel::query()->sole();
        expect($booking->ends_at->equalTo($this->slot->copy()->addMinutes(60)))->toBeTrue();
    });

    it('keeps the barber default duration at a brand without an override', function (): void {
        ($this->override)();

        $this->postJson('/api/v1/bookings', ['chair_id' => $this->otherChair->id, 'starts_at' => $this->slot->toIso8601String(), 'service_ids' => [$this->service->id]])
            ->assertCreated()
            ->assertJsonPath('data.services.0.price_amount_minor', 2000);

        $booking = BookingModel::query()->sole();
        expect($booking->ends_at->equalTo($this->slot->copy()->addMinutes(30)))->toBeTrue();
    });

    it('sizes branch slots by the override duration', function (): void {
        ($this->override)();
        $url = fn (BranchModel $branch, ChairModel $chair): string => '/api/v1/branches/'.$branch->id.'/slots?'.http_build_query([
            'date' => Carbon::tomorrow()->format('Y-m-d'),
            'service_ids' => [$this->service->id],
            'chair_id' => $chair->id,
        ]);

        $overridden = $this->getJson($url($this->branch, $this->chair))->assertOk()->json('data.0');
        $default = $this->getJson($url($this->otherBranch, $this->otherChair))->assertOk()->json('data.0');

        expect(Carbon::parse($overridden['starts_at'])->diffInMinutes(Carbon::parse($overridden['ends_at'])))->toEqual(60)
            ->and(Carbon::parse($default['starts_at'])->diffInMinutes(Carbon::parse($default['ends_at'])))->toEqual(30);
    });
});

describe('revenue and commission', function (): void {
    it('accrues commission on the overriding brand\'s price', function (): void {
        CommissionRuleModel::factory()->create(['value_bps' => 1000]);
        ($this->override)();
        ($this->completedBooking)($this->branch, $this->chair)->touch();
        $other = ($this->completedBooking)($this->otherBranch, $this->otherChair);
        $other->update(['booking_status' => BookingStatus::Pending]);
        $other->update(['booking_status' => BookingStatus::Completed]);
        $branchBooking = BookingModel::query()->where('branch_id', $this->branch->id)->sole();
        $branchBooking->update(['booking_status' => BookingStatus::Pending]);
        $branchBooking->update(['booking_status' => BookingStatus::Completed]);

        $entries = CommissionEntryModel::query()->get()->keyBy('booking_id');
        expect($entries[$branchBooking->id]->base_amount_minor)->toBe(3500)
            ->and($entries[$branchBooking->id]->commission_amount_minor)->toBe(350)
            ->and($entries[$other->id]->base_amount_minor)->toBe(2000)
            ->and($entries[$other->id]->commission_amount_minor)->toBe(200);
    });

    it('counts the override price in the owner earnings and the default elsewhere', function (): void {
        ($this->override)();
        ($this->completedBooking)($this->branch, $this->chair);
        ($this->completedBooking)($this->otherBranch, $this->otherChair);

        $this->authenticateDashboardActor($this->owner)
            ->getJson('/api/v1/dashboard/earnings')
            ->assertOk()
            ->assertJsonPath('data.totals.0.gross_minor', 3500);
    });

    it('counts the override price in the stylist earnings per brand', function (): void {
        ($this->override)();
        ($this->completedBooking)($this->branch, $this->chair);
        ($this->completedBooking)($this->otherBranch, $this->otherChair);

        $this->authenticateDashboardActor($this->barber)
            ->getJson('/api/v1/dashboard/earnings')
            ->assertOk()
            ->assertJsonPath('data.totals.0.gross_minor', 5500);
    });

    it('counts the override price in the overview revenue', function (): void {
        ($this->override)();
        ($this->completedBooking)($this->branch, $this->chair);

        $this->authenticateDashboardActor($this->owner)
            ->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 35);
    });

    it('falls back to the default price after the override is deleted', function (): void {
        ($this->override)()->delete();
        ($this->completedBooking)($this->branch, $this->chair);

        $this->authenticateDashboardActor($this->owner)
            ->getJson('/api/v1/dashboard/earnings')
            ->assertOk()
            ->assertJsonPath('data.totals.0.gross_minor', 2000);
    });

    it('counts the override price in the branch dashboard revenue', function (): void {
        ($this->override)();
        ($this->completedBooking)($this->branch, $this->chair);
        $this->actingAs($this->branch, 'branch_api');

        $this->getJson('/api/v1/branch/dashboard')
            ->assertOk()
            ->assertJsonPath('data.today_revenue', 35)
            ->assertJsonPath('data.monthly_revenue', 35);
    });
});
