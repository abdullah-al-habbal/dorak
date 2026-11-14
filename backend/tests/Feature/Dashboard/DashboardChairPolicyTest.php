<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Gate;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Support\DashboardActor;

describe('Dashboard chair policy', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        $this->otherBranch = BranchModel::factory()->create();
        $this->chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    });

    it('lets the managing branch and a platform admin manage a chair', function (): void {
        $manager = new DashboardActor($this->branch->id, DashboardActorTypeEnum::Branch, 'branch_manager', $this->branch->id, (string) $this->branch->brand_id);
        $admin = DashboardActor::platformAdmin('admin-id');

        expect(Gate::forUser($manager)->allows('dashboard.chair.manage', $this->chair))->toBeTrue()
            ->and(Gate::forUser($manager)->allows('dashboard.chair.create', $this->branch->id))->toBeTrue()
            ->and(Gate::forUser($admin)->allows('dashboard.chair.manage', $this->chair))->toBeTrue();
    });

    it('denies a manager of another branch', function (): void {
        $outsider = new DashboardActor($this->otherBranch->id, DashboardActorTypeEnum::Branch, 'branch_manager', $this->otherBranch->id, (string) $this->otherBranch->brand_id);

        expect(Gate::forUser($outsider)->denies('dashboard.chair.manage', $this->chair))->toBeTrue()
            ->and(Gate::forUser($outsider)->denies('dashboard.chair.create', $this->branch->id))->toBeTrue();
    });
});
