<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\OfferedService\Models\OfferedServiceModel;

describe('Dashboard list search', function (): void {
    beforeEach(function (): void {
        $this->admin = AdminModel::factory()->create();
    });

    it('searches branches by translated name for an admin', function (): void {
        $brand = BrandModel::factory()->create();
        $matching = BranchModel::factory()->create(['brand_id' => $brand->id, 'name' => ['en' => 'Downtown Salon', 'ar' => 'صالون وسط المدينة']]);
        BranchModel::factory()->create(['brand_id' => $brand->id, 'name' => ['en' => 'Uptown Barbers', 'ar' => 'حلاقة أبتاون']]);
        $this->authenticateDashboardActor($this->admin);

        $this->getJson('/api/v1/dashboard/branches?search=Downtown')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matching->id);
    });

    it('scopes a branch manager search to their own branch', function (): void {
        $brand = BrandModel::factory()->create();
        BranchModel::factory()->create(['brand_id' => $brand->id, 'name' => ['en' => 'Downtown Salon', 'ar' => 'صالون وسط المدينة']]);
        $own = BranchModel::factory()->create(['brand_id' => $brand->id, 'name' => ['en' => 'Uptown Barbers', 'ar' => 'حلاقة أبتاون']]);
        $this->authenticateDashboardActor($own);

        $this->getJson('/api/v1/dashboard/branches?search=Downtown')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('searches chairs by label', function (): void {
        $branch = BranchModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $branch->id, 'label' => 'A1']);
        ChairModel::factory()->create(['branch_id' => $branch->id, 'label' => 'B2']);
        $this->authenticateDashboardActor($this->admin);

        $this->getJson('/api/v1/dashboard/chairs?search=A1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.label', 'A1');
    });

    it('searches services by translated name', function (): void {
        $brand = BrandModel::factory()->create();
        OfferedServiceModel::factory()->create([
            'serviceable_type' => 'brand',
            'serviceable_id' => $brand->id,
            'name' => ['en' => 'Classic Haircut', 'ar' => 'قص كلاسيكي'],
        ]);
        OfferedServiceModel::factory()->create([
            'serviceable_type' => 'brand',
            'serviceable_id' => $brand->id,
            'name' => ['en' => 'Beard Trim', 'ar' => 'تهذيب اللحية'],
        ]);
        $this->authenticateDashboardActor($this->admin);

        $this->getJson('/api/v1/dashboard/services?search=Haircut')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('searches stylists by translated name and scopes a manager to their own branch', function (): void {
        $branch = BranchModel::factory()->create();
        $otherBranch = BranchModel::factory()->create();
        $matching = BarberModel::factory()->create(['name' => ['en' => 'Jamie Lee', 'ar' => 'جيمي لي']]);
        $other = BarberModel::factory()->create(['name' => ['en' => 'Alex Ray', 'ar' => 'أليكس راي']]);
        ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $matching->id]);
        ChairModel::factory()->create(['branch_id' => $otherBranch->id, 'barber_id' => $other->id]);
        $this->authenticateDashboardActor($branch);

        $this->getJson('/api/v1/dashboard/stylists?search=Jamie')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matching->id);
    });

    it('rejects a search term longer than 100 characters', function (): void {
        $this->authenticateDashboardActor($this->admin);

        $this->getJson('/api/v1/dashboard/branches?search='.str_repeat('a', 101))
            ->assertUnprocessable();
        $this->getJson('/api/v1/dashboard/chairs?search='.str_repeat('a', 101))
            ->assertUnprocessable();
        $this->getJson('/api/v1/dashboard/services?search='.str_repeat('a', 101))
            ->assertUnprocessable();
        $this->getJson('/api/v1/dashboard/stylists?search='.str_repeat('a', 101))
            ->assertUnprocessable();
    });
});
