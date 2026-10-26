<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\OfferedService\Models\OfferedServiceModel;

describe('Dashboard overview revenue', function (): void {
    it('sums the price of every service on a completed booking', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $serviceA = OfferedServiceModel::factory()->create(['price' => 100]);
        $serviceB = OfferedServiceModel::factory()->create(['price' => 50]);
        $completed = BookingModel::factory()->create(['status' => BookingStatus::Completed]);
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
        $inBranch = BookingModel::factory()->create(['branch_id' => $branch->id, 'status' => BookingStatus::Completed]);
        $inBranch->services()->attach(OfferedServiceModel::factory()->create(['price' => 75])->id);
        $otherBranch = BookingModel::factory()->create(['status' => BookingStatus::Completed]);
        $otherBranch->services()->attach(OfferedServiceModel::factory()->create(['price' => 500])->id);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 75);
    });

    it('returns zero revenue when there are no completed bookings', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $pending = BookingModel::factory()->create(['status' => BookingStatus::Pending]);
        $pending->services()->attach(OfferedServiceModel::factory()->create(['price' => 999])->id);

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.revenue', 0);
    });
});
