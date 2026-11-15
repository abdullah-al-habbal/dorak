<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Gate;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
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
            ->and(Gate::forUser($manager)->denies('dashboard.service.write', [$brand, (string) $this->other->brand_id]))->toBeTrue()
            ->and(Gate::forUser($manager)->denies('dashboard.service.write', [$brand, (string) $this->branch->brand_id]))->toBeTrue();
    });

    it('keeps review filing and walk-ins on the branch side', function (): void {
        $manager = branchManagerActor($this->branch);

        expect(Gate::forUser($this->admin)->denies('dashboard.review.file'))->toBeTrue()
            ->and(Gate::forUser($manager)->allows('dashboard.review.file'))->toBeTrue()
            ->and(Gate::forUser($manager)->allows('dashboard.booking.createWalkIn', $this->branch->id))->toBeTrue()
            ->and(Gate::forUser($manager)->denies('dashboard.booking.createWalkIn', $this->other->id))->toBeTrue();
    });
});

describe('Dashboard booking and stylist policies (S14a, F-06)', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        $this->other = BranchModel::factory()->create();
        $this->admin = DashboardActor::platformAdmin('admin-id');
        $this->stylist = BarberModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $this->stylist->id]);
    });

    it('limits booking writes to the booking\'s own branch, with the admin unrestricted', function (): void {
        $booking = BookingModel::factory()->create(['branch_id' => $this->branch->id]);

        expect(Gate::forUser(branchManagerActor($this->branch))->allows('dashboard.booking.manage', $booking))->toBeTrue()
            ->and(Gate::forUser(branchManagerActor($this->other))->denies('dashboard.booking.manage', $booking))->toBeTrue()
            ->and(Gate::forUser($this->admin)->allows('dashboard.booking.manage', $booking))->toBeTrue();
    });

    it('limits stylist changes to the branches the stylist sits in, and keeps barbers out', function (): void {
        $barberActor = new DashboardActor('b1', DashboardActorTypeEnum::Barber, 'barber');

        expect(Gate::forUser(branchManagerActor($this->branch))->allows('dashboard.stylist.manage', $this->stylist))->toBeTrue()
            ->and(Gate::forUser(branchManagerActor($this->other))->denies('dashboard.stylist.manage', $this->stylist))->toBeTrue()
            ->and(Gate::forUser($this->admin)->allows('dashboard.stylist.manage', $this->stylist))->toBeTrue()
            ->and(Gate::forUser($barberActor)->denies('dashboard.stylist.manage', $this->stylist))->toBeTrue()
            ->and(Gate::forUser(branchManagerActor($this->branch))->allows('dashboard.stylist.create'))->toBeTrue()
            ->and(Gate::forUser($barberActor)->denies('dashboard.stylist.create'))->toBeTrue();
    });

    it('reuses the hours ability for hours exceptions and the floor plan', function (): void {
        expect(Gate::forUser(branchManagerActor($this->branch))->allows('dashboard.branch.updateHours', $this->branch))->toBeTrue()
            ->and(Gate::forUser(branchManagerActor($this->other))->denies('dashboard.branch.updateHours', $this->branch))->toBeTrue();
    });
});

describe('Dashboard staffing, brand and branch lifecycle policies (S14b, F-06)', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        $this->other = BranchModel::factory()->create();
        $this->admin = DashboardActor::platformAdmin('admin-id');
        $this->barber = new DashboardActor('b1', DashboardActorTypeEnum::Barber, 'barber');
        $this->owner = new DashboardActor('o1', DashboardActorTypeEnum::Owner, 'owner', null, (string) $this->branch->brand_id, [(string) $this->branch->brand_id], [(string) $this->branch->id]);
    });

    it('limits staffing to the admin, the branch manager and the brand owner of that branch', function (): void {
        expect(Gate::forUser($this->admin)->allows('dashboard.staffing.manage', $this->other))->toBeTrue()
            ->and(Gate::forUser(branchManagerActor($this->branch))->allows('dashboard.staffing.manage', $this->branch))->toBeTrue()
            ->and(Gate::forUser(branchManagerActor($this->branch))->denies('dashboard.staffing.manage', $this->other))->toBeTrue()
            ->and(Gate::forUser($this->owner)->allows('dashboard.staffing.manage', $this->branch))->toBeTrue()
            ->and(Gate::forUser($this->owner)->denies('dashboard.staffing.manage', $this->other))->toBeTrue()
            ->and(Gate::forUser($this->barber)->denies('dashboard.staffing.manage', $this->branch))->toBeTrue();
    });

    it('lets only an owner create a brand and only its owner or the admin change it', function (): void {
        $brandId = (string) $this->branch->brand_id;

        expect(Gate::forUser($this->owner)->allows('dashboard.brand.create'))->toBeTrue()
            ->and(Gate::forUser($this->admin)->denies('dashboard.brand.create'))->toBeTrue()
            ->and(Gate::forUser(branchManagerActor($this->branch))->denies('dashboard.brand.create'))->toBeTrue()
            ->and(Gate::forUser($this->owner)->allows('dashboard.brand.update', $brandId))->toBeTrue()
            ->and(Gate::forUser($this->owner)->denies('dashboard.brand.update', (string) $this->other->brand_id))->toBeTrue()
            ->and(Gate::forUser(branchManagerActor($this->branch))->denies('dashboard.brand.update', $brandId))->toBeTrue()
            ->and(Gate::forUser($this->admin)->allows('dashboard.brand.update', $brandId))->toBeTrue();
    });

    it('keeps suspension with the admin and the on/off switch with the owner of that branch', function (): void {
        $manager = branchManagerActor($this->branch);

        expect(Gate::forUser($this->admin)->allows('dashboard.branchLifecycle.suspend'))->toBeTrue()
            ->and(Gate::forUser($this->owner)->denies('dashboard.branchLifecycle.suspend'))->toBeTrue()
            ->and(Gate::forUser($this->owner)->allows('dashboard.branchLifecycle.switch', (string) $this->branch->id))->toBeTrue()
            ->and(Gate::forUser($this->owner)->denies('dashboard.branchLifecycle.switch', (string) $this->other->id))->toBeTrue()
            ->and(Gate::forUser($manager)->denies('dashboard.branchLifecycle.switch', (string) $this->branch->id))->toBeTrue()
            ->and(Gate::forUser($this->admin)->allows('dashboard.branchLifecycle.switch', (string) $this->other->id))->toBeTrue();
    });
});
