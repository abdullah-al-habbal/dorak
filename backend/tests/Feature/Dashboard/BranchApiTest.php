<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;

describe('Dashboard Branch API', function (): void {
    beforeEach(function (): void {
        $this->admin = AdminModel::factory()->create();
        $this->branch = BranchModel::factory()->create();
    });

    it('requires dashboard authentication', function (): void {
        $this->getJson('/api/v1/dashboard/branches')->assertUnauthorized();
    });

    it('limits a branch manager to branches in its operational brand while allowing branch lifecycle management', function (): void {
        $sameBrand = BranchModel::factory()->create(['brand_id' => $this->branch->brand_id]);
        $other = BranchModel::factory()->create();
        $this->actingAs($this->branch, 'branch_api');

        $this->getJson("/api/v1/dashboard/branches/{$sameBrand->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/branches/{$other->id}")->assertNotFound();
        $this->postJson('/api/v1/dashboard/branches', [
            'brand_id' => $this->branch->brand_id,
            'name' => ['en' => 'Managed Branch', 'ar' => 'فرع مُدار'],
            'email' => 'managed-branch@example.test',
            'password' => 'a-secure-manager-created-password',
        ])->assertCreated();
        $this->deleteJson("/api/v1/dashboard/branches/{$sameBrand->id}")->assertOk();
        $this->deleteJson("/api/v1/dashboard/branches/{$other->id}")->assertForbidden();
    });

    it('requires a password when an admin creates a branch', function (): void {
        $this->actingAs($this->admin, 'admin_api');
        $brand = BrandModel::factory()->create();
        $payload = ['brand_id' => $brand->id, 'name' => ['en' => 'Dashboard Branch', 'ar' => 'فرع لوحة التحكم'], 'email' => 'dashboard-branch@example.test'];

        $this->postJson('/api/v1/dashboard/branches', $payload)->assertUnprocessable()->assertJsonValidationErrors('password');
    });
});
