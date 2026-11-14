<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Gate;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Support\DashboardActor;
use Modules\OfferedService\Enums\ServiceableTypeEnum;

function branchManagerActor(BranchModel $branch): DashboardActor
{
    return new DashboardActor($branch->id, DashboardActorTypeEnum::Branch, 'branch_manager', $branch->id, (string) $branch->brand_id);
}

describe('Dashboard branch, service, review and walk-in policies', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        $this->other = BranchModel::factory()->create();
        $this->admin = DashboardActor::platformAdmin('admin-id');
    });

    it('lets a manager update only their own branch within its brand', function (): void {
        $manager = branchManagerActor($this->branch);

        expect(Gate::forUser($manager)->allows('dashboard.branch.update', [$this->branch, $this->branch->brand_id]))->toBeTrue()
            ->and(Gate::forUser($manager)->denies('dashboard.branch.update', [$this->branch, $this->other->brand_id]))->toBeTrue()
            ->and(Gate::forUser($manager)->denies('dashboard.branch.update', [$this->other, $this->other->brand_id]))->toBeTrue()
            ->and(Gate::forUser($manager)->allows('dashboard.branch.updateHours', $this->branch))->toBeTrue()
            ->and(Gate::forUser($manager)->denies('dashboard.branch.updateHours', $this->other))->toBeTrue()
            ->and(Gate::forUser($this->admin)->allows('dashboard.branch.update', [$this->other, $this->branch->brand_id]))->toBeTrue();
    });

    it('lets a manager neither create nor delete a branch outside their brand', function (): void {
        $manager = branchManagerActor($this->branch);

        expect(Gate::forUser($manager)->denies('dashboard.branch.create', $this->other->brand_id))->toBeTrue()
            ->and(Gate::forUser($manager)->denies('dashboard.branch.delete', $this->other))->toBeTrue()
            ->and(Gate::forUser($this->admin)->allows('dashboard.branch.delete', $this->other))->toBeTrue();
    });

    it('limits service writes to brand services the actor manages', function (): void {
        $manager = branchManagerActor($this->branch);
        $brand = ServiceableTypeEnum::Brand->value;

        expect(Gate::forUser($this->admin)->allows('dashboard.service.write', [ServiceableTypeEnum::Barber->value, 'any']))->toBeTrue()
            ->and(Gate::forUser($manager)->denies('dashboard.service.write', [ServiceableTypeEnum::Barber->value, 'any']))->toBeTrue()
            ->and(Gate::forUser($manager)->denies('dashboard.service.write', [$brand, (string) $this->other->brand_id]))->toBeTrue();
    });

    it('keeps review filing and walk-ins on the branch side', function (): void {
        $manager = branchManagerActor($this->branch);

        expect(Gate::forUser($this->admin)->denies('dashboard.review.file'))->toBeTrue()
            ->and(Gate::forUser($manager)->allows('dashboard.review.file'))->toBeTrue()
            ->and(Gate::forUser($manager)->allows('dashboard.booking.createWalkIn', $this->branch->id))->toBeTrue()
            ->and(Gate::forUser($manager)->denies('dashboard.booking.createWalkIn', $this->other->id))->toBeTrue();
    });
});
