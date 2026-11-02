<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Models\OfferedServiceModel;

describe('Dashboard overview revenue', function (): void {
    it('sums the price of every service on a completed booking', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $serviceA = OfferedServiceModel::factory()->create(['price_amount_minor' => 10000]);
        $serviceB = OfferedServiceModel::factory()->create(['price_amount_minor' => 5000]);
        $completed = BookingModel::factory()->create(['booking_status' => BookingStatus::Completed, 'starts_at' => now()]);
        $completed->services()->attach([$serviceA->id, $serviceB->id]);
        $pending = BookingModel::factory()->create(['booking_status' => BookingStatus::Pending]);
        $pending->services()->attach(OfferedServiceModel::factory()->create(['price_amount_minor' => 99900])->id);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 150);
    });

    it('scopes revenue to the manager branch', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);
        $inBranch = BookingModel::factory()->create(['branch_id' => $branch->id, 'booking_status' => BookingStatus::Completed, 'starts_at' => now()]);
        $inBranch->services()->attach(OfferedServiceModel::factory()->create(['price_amount_minor' => 7500])->id);
        $otherBranch = BookingModel::factory()->create(['booking_status' => BookingStatus::Completed, 'starts_at' => now()]);
        $otherBranch->services()->attach(OfferedServiceModel::factory()->create(['price_amount_minor' => 50000])->id);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 75);
    });

    it('excludes completed bookings outside today from revenue', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $yesterday = BookingModel::factory()->create(['booking_status' => BookingStatus::Completed, 'starts_at' => now()->subDay()]);
        $yesterday->services()->attach(OfferedServiceModel::factory()->create(['price_amount_minor' => 30000])->id);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 0);
    });

    it('returns zero revenue when there are no completed bookings', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $pending = BookingModel::factory()->create(['booking_status' => BookingStatus::Pending]);
        $pending->services()->attach(OfferedServiceModel::factory()->create(['price_amount_minor' => 99900])->id);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 0);
    });

    it('reports the branch brand currency for a branch manager', function (): void {
        $currency = CurrencyModel::factory()->create(['code' => 'JOD']);
        $brand = BrandModel::factory()->create(['base_currency_code' => $currency->code]);
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
        $this->authenticateDashboardActor($branch);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue_currency', 'JOD');
    });

    it('reports the platform default currency for an admin', function (): void {
        $default = CurrencyModel::factory()->create(['code' => 'SYP', 'is_default' => true]);
        CurrencyModel::factory()->create(['code' => 'USD', 'is_default' => false]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue_currency', $default->code);
    });
});
