<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Review\Models\ReviewModel;

describe('Dashboard branch floor plan', function (): void {
    it('lets a manager read and save their branch floor plan with canvas and decorations', function (): void {
        $branch = BranchModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $branch->id]);
        $this->authenticateDashboardActor($branch);

        $this->patchJson("/api/v1/dashboard/branches/{$branch->id}/floor-plan", [
            'preset' => 'standard',
            'canvas' => ['width' => 25, 'height' => 10, 'unit' => 'm'],
            'decorations' => [['type' => 'mirror', 'x' => 1, 'y' => 2, 'width' => 10, 'height' => 5]],
        ])->assertOk()->assertJsonPath('data.canvas.width', 25);

        $this->getJson("/api/v1/dashboard/branches/{$branch->id}/floor-plan")
            ->assertOk()
            ->assertJsonPath('data.floor_plan.decorations.0.type', 'mirror')
            ->assertJsonCount(1, 'data.chairs');
    });

    it('returns 422 field errors for an invalid payload', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->patchJson("/api/v1/dashboard/branches/{$branch->id}/floor-plan", [
            'preset' => 'standard',
            'canvas' => ['width' => -1, 'height' => 10, 'unit' => 'm'],
        ])->assertUnprocessable()->assertJsonValidationErrors(['canvas.width']);
    });

    it('requires both zones for a unisex zoned layout', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->patchJson("/api/v1/dashboard/branches/{$branch->id}/floor-plan", [
            'preset' => 'unisex_zoned',
            'zones' => [['zone' => 'men', 'x' => 0, 'y' => 0, 'width' => 50, 'height' => 100]],
        ])->assertUnprocessable();
    });

    it('does not let a manager read or edit another branch', function (): void {
        $branch = BranchModel::factory()->create();
        $other = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->getJson("/api/v1/dashboard/branches/{$other->id}/floor-plan")->assertNotFound();
        $this->patchJson("/api/v1/dashboard/branches/{$other->id}/floor-plan", ['preset' => 'standard'])->assertNotFound();
        $this->getJson("/api/v1/dashboard/branches/{$other->id}/reviews")->assertNotFound();
    });

    it('lets an admin edit any branch', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson("/api/v1/dashboard/branches/{$branch->id}/floor-plan", ['preset' => 'compact'])
            ->assertOk()->assertJsonPath('data.preset', 'compact');
    });
});

describe('Dashboard branch reviews', function (): void {
    it('paginates the branch reviews', function (): void {
        $branch = BranchModel::factory()->create();
        ReviewModel::factory()->count(3)->create(['subject_type' => 'branch', 'subject_id' => $branch->id]);
        ReviewModel::factory()->create(['subject_type' => 'branch', 'subject_id' => BranchModel::factory()->create()->id]);
        $this->authenticateDashboardActor($branch);

        $this->getJson("/api/v1/dashboard/branches/{$branch->id}/reviews?per_page=2")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.pagination.total', 3);
    });
});
