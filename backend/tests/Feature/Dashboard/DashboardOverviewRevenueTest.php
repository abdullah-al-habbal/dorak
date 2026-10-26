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
        $serviceA = OfferedServiceModel::factory()->create(['price' => 100]);
        $serviceB = OfferedServiceModel::factory()->create(['price' => 50]);
        $completed = BookingModel::factory()->create(['status' => BookingStatus::Completed, 'time_slot' => now()]);
        $completed->services()->attach([$serviceA->id, $serviceB->id]);
        $pending = BookingModel::factory()->create(['status' => BookingStatus::Pending]);
        $pending->services()->attach(OfferedServiceModel::factory()->create(['price' => 999])->id);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 150);
    });

    it('scopes revenue to the manager branch', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);
        $inBranch = BookingModel::factory()->create(['branch_id' => $branch->id, 'status' => BookingStatus::Completed, 'time_slot' => now()]);
        $inBranch->services()->attach(OfferedServiceModel::factory()->create(['price' => 75])->id);
        $otherBranch = BookingModel::factory()->create(['status' => BookingStatus::Completed, 'time_slot' => now()]);
        $otherBranch->services()->attach(OfferedServiceModel::factory()->create(['price' => 500])->id);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 75);
    });

    it('excludes completed bookings outside today from revenue', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $yesterday = BookingModel::factory()->create(['status' => BookingStatus::Completed, 'time_slot' => now()->subDay()]);
        $yesterday->services()->attach(OfferedServiceModel::factory()->create(['price' => 300])->id);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 0);
    });

    it('returns zero revenue when there are no completed bookings', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $pending = BookingModel::factory()->create(['status' => BookingStatus::Pending]);
        $pending->services()->attach(OfferedServiceModel::factory()->create(['price' => 999])->id);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 0);
    });

    it('reports the branch brand currency for a branch manager', function (): void {
        $currency = CurrencyModel::factory()->create(['code' => 'JOD']);
        $brand = BrandModel::factory()->create(['base_currency_id' => $currency->id]);
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
