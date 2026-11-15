<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Exceptions\BranchReadOnlyException;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Exceptions\BrandSuspendedException;
use Modules\Brand\Models\BrandModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\ScopedBranchResolver;

function guardTestBranch(BrandStatusEnum $brand = BrandStatusEnum::Active, BranchStatusEnum $branch = BranchStatusEnum::Enabled): BranchModel
{
    $brandModel = BrandModel::factory()->create(['status' => $brand]);

    return BranchModel::factory()->create(['brand_id' => $brandModel->id, 'status' => $branch])->load('brand');
}

function guardTestManager(BranchModel $branch): DashboardActor
{
    return new DashboardActor('manager-'.$branch->id, DashboardActorTypeEnum::Branch, 'branch_manager', (string) $branch->id, (string) $branch->brand_id);
}

function guardTestOwner(BranchModel $branch): DashboardActor
{
    return new DashboardActor('owner-'.$branch->id, DashboardActorTypeEnum::Owner, 'owner', null, null, [(string) $branch->brand_id], [(string) $branch->id]);
}

function guardTestAdmin(): DashboardActor
{
    return DashboardActor::platformAdmin('admin-1');
}

describe('DashboardWriteGuard (F-01, decision A)', function (): void {
    it('lets a manager and an owner write while the brand and branch are active', function (): void {
        $branch = guardTestBranch();

        app(DashboardWriteGuard::class)->ensureBranchWritable(guardTestManager($branch), $branch);
        app(DashboardWriteGuard::class)->ensureBranchWritable(guardTestOwner($branch), $branch);

        expect(true)->toBeTrue();
    });

    it('keeps Pending and Disabled branches writable for setup (D9)', function (BranchStatusEnum $status): void {
        $branch = guardTestBranch(branch: $status);

        app(DashboardWriteGuard::class)->ensureBranchWritable(guardTestManager($branch), $branch);
        app(DashboardWriteGuard::class)->ensureBranchWritable(guardTestOwner($branch), $branch);

        expect(true)->toBeTrue();
    })->with([BranchStatusEnum::Pending, BranchStatusEnum::Disabled]);

    it('keeps a branch of a Pending brand writable (D9)', function (): void {
        $branch = guardTestBranch(BrandStatusEnum::Pending, BranchStatusEnum::Pending);

        app(DashboardWriteGuard::class)->ensureBranchWritable(guardTestOwner($branch), $branch);

        expect(true)->toBeTrue();
    });

    it('refuses every tenant actor on a Suspended brand with brand_suspended', function (string $actor): void {
        $branch = guardTestBranch(BrandStatusEnum::Suspended);
        $who = $actor === 'manager' ? guardTestManager($branch) : guardTestOwner($branch);

        expect(fn () => app(DashboardWriteGuard::class)->ensureBranchWritable($who, $branch))->toThrow(BrandSuspendedException::class);
        expect(fn () => app(DashboardWriteGuard::class)->ensureBrandWritable($who, $branch->brand_id))->toThrow(BrandSuspendedException::class);
    })->with(['manager', 'owner']);

    it('refuses every tenant actor on a Suspended branch of an active brand with branch_read_only', function (string $actor): void {
        $branch = guardTestBranch(branch: BranchStatusEnum::Suspended);
        $who = $actor === 'manager' ? guardTestManager($branch) : guardTestOwner($branch);

        expect(fn () => app(DashboardWriteGuard::class)->ensureBranchWritable($who, $branch))->toThrow(BranchReadOnlyException::class);
    })->with(['manager', 'owner']);

    it('lets the platform admin act on a suspended brand and branch', function (): void {
        $branch = guardTestBranch(BrandStatusEnum::Suspended, BranchStatusEnum::Suspended);

        app(DashboardWriteGuard::class)->ensureBranchWritable(guardTestAdmin(), $branch);
        app(DashboardWriteGuard::class)->ensureBrandWritable(guardTestAdmin(), $branch->brand_id);

        expect(true)->toBeTrue();
    });

    it('renders the stable 403 error bodies', function (): void {
        $brand = (new BrandSuspendedException)->render();
        $branch = (new BranchReadOnlyException)->render();

        expect($brand->getStatusCode())->toBe(403)
            ->and($brand->getData(true)['code'])->toBe('brand_suspended')
            ->and($branch->getStatusCode())->toBe(403)
            ->and($branch->getData(true)['code'])->toBe('branch_read_only');
    });
});

describe('ScopedBranchResolver::resolveForWrite', function (): void {
    function guardTestRequest(DashboardActor $actor): Request
    {
        $request = Request::create('/');
        $request->attributes->set('dashboard_actor', $actor);

        return $request;
    }

    it('returns the branch in scope when it is writable', function (): void {
        $branch = guardTestBranch();

        $resolved = app(ScopedBranchResolver::class)->resolveForWrite(guardTestRequest(guardTestManager($branch)), (string) $branch->id);

        expect($resolved->id)->toBe($branch->id);
    });

    it('refuses a suspended brand or branch after the scope check', function (): void {
        $brandSuspended = guardTestBranch(BrandStatusEnum::Suspended);
        $branchSuspended = guardTestBranch(branch: BranchStatusEnum::Suspended);

        expect(fn () => app(ScopedBranchResolver::class)->resolveForWrite(guardTestRequest(guardTestOwner($brandSuspended)), (string) $brandSuspended->id))->toThrow(BrandSuspendedException::class)
            ->and(fn () => app(ScopedBranchResolver::class)->resolveForWrite(guardTestRequest(guardTestManager($branchSuspended)), (string) $branchSuspended->id))->toThrow(BranchReadOnlyException::class);
    });

    it('is not found (404) for a branch outside the actor scope, never revealing its state', function (): void {
        $mine = guardTestBranch();
        $other = guardTestBranch(BrandStatusEnum::Suspended, BranchStatusEnum::Suspended);

        expect(fn () => app(ScopedBranchResolver::class)->resolveForWrite(guardTestRequest(guardTestManager($mine)), (string) $other->id))
            ->toThrow(ModelNotFoundException::class);
    });

    it('finds no branch for a barber, as resolve does', function (): void {
        $branch = guardTestBranch();
        $barber = new DashboardActor('barber-1', DashboardActorTypeEnum::Barber, 'barber');

        expect(fn () => app(ScopedBranchResolver::class)->resolveForWrite(guardTestRequest($barber), (string) $branch->id))
            ->toThrow(ModelNotFoundException::class);
    });
});
