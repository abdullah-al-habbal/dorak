<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    $this->currency = CurrencyModel::factory()->create();
});

/** Completed booking in $branch worth $price (minor) by $barber, with an optional commission entry. */
function completedBooking(BranchModel $branch, string $currency, int $price, ?BarberModel $barber = null, ?int $commission = null, array $attributes = []): BookingModel
{
    $booking = BookingModel::factory()->create(array_merge([
        'branch_id' => $branch->id,
        'barber_id' => $barber?->id,
        'booking_status' => BookingStatus::Completed,
        'starts_at' => now(),
    ], $attributes));
    $booking->services()->attach(OfferedServiceModel::factory()->create(['price_amount_minor' => $price, 'currency_code' => $currency])->id);

    if ($commission !== null) {
        CommissionEntryModel::factory()->create([
            'booking_id' => $booking->id,
            'brand_id' => $branch->brand_id,
            'branch_id' => $branch->id,
            'base_amount_minor' => $price,
            'commission_amount_minor' => $commission,
            'currency_code' => $currency,
        ]);
    }

    return $booking;
}

describe('GET /dashboard/earnings', function (): void {
    it('gives an owner gross, commission and net across every owned brand only', function (): void {
        $owner = ClientModel::factory()->create();
        $brandA = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $brandB = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $branchA = BranchModel::factory()->create(['brand_id' => $brandA->id]);
        $branchB = BranchModel::factory()->create(['brand_id' => $brandB->id]);
        $foreign = BranchModel::factory()->create();
        completedBooking($branchA, $this->currency->code, 10000, commission: 1000);
        completedBooking($branchB, $this->currency->code, 5000, commission: 500);
        completedBooking($foreign, $this->currency->code, 99000, commission: 9900);

        $this->authenticateDashboardActor($owner)
            ->getJson('/api/v1/dashboard/earnings')
            ->assertOk()
            ->assertJsonPath('data.scope', 'brand')
            ->assertJsonPath('data.totals.0.currency_code', $this->currency->code)
            ->assertJsonPath('data.totals.0.gross_minor', 15000)
            ->assertJsonPath('data.totals.0.commission_minor', 1500)
            ->assertJsonPath('data.totals.0.net_minor', 13500)
            ->assertJsonPath('data.totals.0.completed_bookings_count', 2);
    });

    it('limits a manager to the own branch', function (): void {
        $branch = BranchModel::factory()->create();
        $sibling = BranchModel::factory()->create(['brand_id' => $branch->brand_id]);
        completedBooking($branch, $this->currency->code, 7000, commission: 700);
        completedBooking($sibling, $this->currency->code, 40000, commission: 4000);

        $this->authenticateDashboardActor($branch)
            ->getJson('/api/v1/dashboard/earnings')
            ->assertOk()
            ->assertJsonPath('data.scope', 'branch')
            ->assertJsonPath('data.totals.0.gross_minor', 7000)
            ->assertJsonPath('data.totals.0.net_minor', 6300);
    });

    it('ignores bookings that are not completed or fall outside the period', function (): void {
        $branch = BranchModel::factory()->create();
        completedBooking($branch, $this->currency->code, 1000);
        completedBooking($branch, $this->currency->code, 8000, attributes: ['booking_status' => BookingStatus::Pending]);
        completedBooking($branch, $this->currency->code, 4000, attributes: ['starts_at' => now()->subMonths(3)]);

        $this->authenticateDashboardActor($branch)
            ->getJson('/api/v1/dashboard/earnings?from='.now()->subDay()->toDateString())
            ->assertOk()
            ->assertJsonCount(1, 'data.totals')
            ->assertJsonPath('data.totals.0.gross_minor', 1000);
    });

    it('shows a stylist only personal gross, with net when an active affiliation has a percent', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $other = BarberModel::factory()->create();
        BarberAffiliationModel::factory()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $branch->id,
            'affiliable_type' => AffiliableType::Branch,
            'status' => AffiliationStatus::Active,
            'commission_percent' => 20,
        ]);
        completedBooking($branch, $this->currency->code, 10000, $barber);
        completedBooking($branch, $this->currency->code, 90000, $other);

        $this->authenticateDashboardActor($barber)
            ->getJson('/api/v1/dashboard/earnings')
            ->assertOk()
            ->assertJsonPath('data.scope', 'barber')
            ->assertJsonPath('data.totals.0.gross_minor', 10000)
            ->assertJsonPath('data.totals.0.net_minor', 8000)
            ->assertJsonMissingPath('data.totals.0.commission_minor');
    });

    it('withholds stylist net pay without an active percent affiliation', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        BarberAffiliationModel::factory()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $branch->id,
            'affiliable_type' => AffiliableType::Branch,
            'status' => AffiliationStatus::Terminated,
            'commission_percent' => 20,
        ]);
        completedBooking($branch, $this->currency->code, 10000, $barber);

        $this->authenticateDashboardActor($barber)
            ->getJson('/api/v1/dashboard/earnings')
            ->assertOk()
            ->assertJsonPath('data.totals.0.gross_minor', 10000)
            ->assertJsonPath('data.totals.0.net_minor', null);
    });

    it('rejects platform admins and unauthenticated callers', function (): void {
        $this->getJson('/api/v1/dashboard/earnings')->assertUnauthorized();
        $this->authenticateDashboardActor(AdminModel::factory()->create())
            ->getJson('/api/v1/dashboard/earnings')
            ->assertForbidden();
    });

    it('validates the period', function (): void {
        $this->authenticateDashboardActor(BranchModel::factory()->create())
            ->getJson('/api/v1/dashboard/earnings?from=2026-02-01&to=2026-01-01')
            ->assertUnprocessable();
    });
});
