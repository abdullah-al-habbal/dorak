<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;

describe('Dashboard Branch API', function (): void {
    beforeEach(function (): void {
        $this->admin = AdminModel::factory()->create();
        $this->branch = BranchModel::factory()->create();
        config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
    });

    it('requires dashboard authentication', function (): void {
        $this->getJson('/api/v1/dashboard/branches')->assertUnauthorized();
    });

    it('limits a branch manager to only its assigned branch', function (): void {
        $sameBrand = BranchModel::factory()->create(['brand_id' => $this->branch->brand_id]);
        $other = BranchModel::factory()->create();
        $this->authenticateDashboardActor($this->branch);

        $this->getJson('/api/v1/dashboard/branches')->assertOk()->assertJsonPath('data.0.id', $this->branch->id)->assertJsonCount(1, 'data');
        $this->getJson("/api/v1/dashboard/branches/{$this->branch->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/branches/{$sameBrand->id}")->assertNotFound();
        $this->getJson("/api/v1/dashboard/branches/{$other->id}")->assertNotFound();
        $branchesBeforeCreate = BranchModel::query()->count();
        $this->postJson('/api/v1/dashboard/branches', [
            'brand_id' => $this->branch->brand_id,
            'name' => ['en' => 'Managed Branch', 'ar' => 'فرع مُدار'],
            'email' => 'managed-branch@example.test',
            'password' => 'a-secure-manager-created-password',
        ])->assertForbidden();
        expect(BranchModel::query()->count())->toBe($branchesBeforeCreate);
        $this->deleteJson("/api/v1/dashboard/branches/{$this->branch->id}")->assertForbidden();
        $this->deleteJson("/api/v1/dashboard/branches/{$sameBrand->id}")->assertForbidden();
        $this->deleteJson("/api/v1/dashboard/branches/{$other->id}")->assertForbidden();

        $payload = [
            'brand_id' => $this->branch->brand_id,
            'name' => ['en' => 'Updated Branch', 'ar' => 'فرع محدث'],
            'email' => 'updated-branch@example.test',
        ];
        $this->putJson("/api/v1/dashboard/branches/{$sameBrand->id}", $payload)->assertForbidden();
        $this->putJson("/api/v1/dashboard/branches/{$this->branch->id}", $payload)->assertOk();
    });

    it('prevents an admin from deleting the brand last branch', function (): void {
        $this->authenticateDashboardActor($this->admin);

        $this->deleteJson("/api/v1/dashboard/branches/{$this->branch->id}")->assertStatus(409);
        expect(BranchModel::query()->whereKey($this->branch->id)->exists())->toBeTrue();
    });

    it('allows an admin to delete one of multiple branches', function (): void {
        $secondBranch = BranchModel::factory()->create(['brand_id' => $this->branch->brand_id]);
        $this->authenticateDashboardActor($this->admin);

        $this->deleteJson("/api/v1/dashboard/branches/{$this->branch->id}")->assertOk();
        expect(BranchModel::query()->whereKey($this->branch->id)->exists())->toBeFalse()
            ->and(BranchModel::query()->whereKey($secondBranch->id)->exists())->toBeTrue();
    });

    it('blocks deletion while a branch has an upcoming booking', function (): void {
        $secondBranch = BranchModel::factory()->create(['brand_id' => $this->branch->brand_id]);
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        BookingModel::factory()->create(['chair_id' => $chair->id, 'starts_at' => now()->addDay()]);
        $this->authenticateDashboardActor($this->admin);

        $this->deleteJson("/api/v1/dashboard/branches/{$this->branch->id}")->assertStatus(409);
        expect(BranchModel::query()->whereKey($this->branch->id)->exists())->toBeTrue();
        expect(BranchModel::query()->whereKey($secondBranch->id)->exists())->toBeTrue();
    });

    it('prevents switching off the last active branch of a brand', function (): void {
        $this->authenticateDashboardActor($this->admin);

        $this->patchJson("/api/v1/dashboard/branches/{$this->branch->id}/switch-off")->assertStatus(409);
        expect($this->branch->fresh()->status->value)->toBe(BranchStatusEnum::Enabled->value);
    });

    it('requires a password when an admin creates a branch', function (): void {
        $this->authenticateDashboardActor($this->admin);
        $brand = BrandModel::factory()->create();
        $payload = ['brand_id' => $brand->id, 'name' => ['en' => 'Dashboard Branch', 'ar' => 'فرع لوحة التحكم'], 'email' => 'dashboard-branch@example.test'];

        $this->postJson('/api/v1/dashboard/branches', $payload)->assertUnprocessable()->assertJsonValidationErrors('password');
    });

    it('filters the branch list by status and brand', function (): void {
        $brand = BrandModel::factory()->create();
        $enabled = BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => BranchStatusEnum::Enabled]);
        $disabled = BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => BranchStatusEnum::Disabled]);
        $this->authenticateDashboardActor($this->admin);

        $this->getJson("/api/v1/dashboard/branches?brand_id={$brand->id}&status=disabled")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $disabled->id);
        $this->getJson("/api/v1/dashboard/branches?brand_id={$brand->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $enabled->id]);
        $this->getJson('/api/v1/dashboard/branches?status=bogus')->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->getJson('/api/v1/dashboard/branches?brand_id=not-a-uuid')->assertUnprocessable()->assertJsonValidationErrors('brand_id');
    });

    it('never lets a brand filter widen a manager scope to another brand', function (): void {
        $other = BranchModel::factory()->create();
        $this->authenticateDashboardActor($this->branch);

        $this->getJson("/api/v1/dashboard/branches?brand_id={$other->brand_id}")
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });
});
