<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Gate;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

describe('Dashboard brand list (admin approval queue)', function (): void {
    it('filters by status for an admin', function (): void {
        $pending = BrandModel::factory()->pending()->create();
        $active = BrandModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $ids = collect($this->getJson('/api/v1/dashboard/brands?status=pending')->assertOk()->json('data'))->pluck('id');
        expect($ids)->toContain($pending->id)->not->toContain($active->id);

        $ids = collect($this->getJson('/api/v1/dashboard/brands')->assertOk()->json('data'))->pluck('id');
        expect($ids)->toContain($pending->id)->toContain($active->id);
    });

    it('rejects an unknown status', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson('/api/v1/dashboard/brands?status=bogus')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    });

    it('keeps an owner scoped to their own brands when filtering', function (): void {
        $owner = ClientModel::factory()->create();
        $own = BrandModel::factory()->pending()->create(['owner_id' => $owner->id]);
        $other = BrandModel::factory()->pending()->create();
        $this->authenticateDashboardActor($owner);

        $ids = collect($this->getJson('/api/v1/dashboard/brands?status=pending')->assertOk()->json('data'))->pluck('id');

        expect($ids->all())->toBe([$own->id])->and($ids)->not->toContain($other->id);
    });

    it('clamps a page size above the platform maximum instead of rejecting it', function (): void {
        app(SettingsService::class)->update([SettingKey::PaginationMaxPerPage->value => 50]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson('/api/v1/dashboard/brands?per_page=100')
            ->assertOk()
            ->assertJsonPath('meta.pagination.per_page', 50);
        $this->getJson('/api/v1/dashboard/brands?per_page=0')
            ->assertOk()
            ->assertJsonPath('meta.pagination.per_page', 1);
    });

    it('keeps the brand resource shape', function (): void {
        BrandModel::factory()->pending()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $row = $this->getJson('/api/v1/dashboard/brands')->assertOk()->json('data.0');

        expect(array_keys($row))->toBe(['id', 'name', 'description', 'logo_url', 'owner', 'base_currency', 'slug', 'universe', 'status', 'status_reason', 'submission_count', 'max_submissions', 'branches_count', 'features', 'created_at']);
    });

    it('forbids managers and barbers', function (): void {
        foreach ([BranchModel::factory()->create(), BarberModel::factory()->create()] as $actor) {
            $this->authenticateDashboardActor($actor)->getJson('/api/v1/dashboard/brands')->assertForbidden();
        }
    });
});

describe('Brand approval authorization', function (): void {
    it('forbids managers, barbers and owners from approving and leaves the brand pending', function (): void {
        $brand = BrandModel::factory()->pending()->create();

        foreach ([BranchModel::factory()->create(), BarberModel::factory()->create(), $brand->owner] as $actor) {
            $this->authenticateDashboardActor($actor)
                ->patchJson("/api/v1/dashboard/admin/brands/{$brand->id}/approve")
                ->assertForbidden();
        }

        expect($brand->refresh()->status)->toBe(BrandStatusEnum::Pending);
    });

    it('denies approval to anyone but a platform admin at the policy level', function (): void {
        $brand = BrandModel::factory()->pending()->create();

        expect(Gate::forUser(null)->allows('approve', $brand))->toBeFalse()
            ->and(Gate::forUser($brand->owner)->allows('approve', $brand))->toBeFalse()
            ->and(Gate::forUser(new DashboardActor('x', DashboardActorTypeEnum::Admin, 'platform_admin'))->allows('approve', $brand))->toBeFalse()
            ->and(Gate::forUser(AdminModel::factory()->create())->allows('approve', $brand))->toBeTrue();
    });

    it('lets admins and owners list brands at the policy level, and nobody else', function (): void {
        expect(Gate::forUser(AdminModel::factory()->create())->allows('viewAny', BrandModel::class))->toBeTrue()
            ->and(Gate::forUser(new DashboardActor('a', DashboardActorTypeEnum::Admin, 'platform_admin'))->allows('viewAny', BrandModel::class))->toBeTrue()
            ->and(Gate::forUser(new DashboardActor('o', DashboardActorTypeEnum::Owner, 'brand_owner'))->allows('viewAny', BrandModel::class))->toBeTrue()
            ->and(Gate::forUser(new DashboardActor('m', DashboardActorTypeEnum::Branch, 'branch_manager'))->allows('viewAny', BrandModel::class))->toBeFalse()
            ->and(Gate::forUser(new DashboardActor('b', DashboardActorTypeEnum::Barber, 'barber'))->allows('viewAny', BrandModel::class))->toBeFalse()
            ->and(Gate::forUser(null)->allows('viewAny', BrandModel::class))->toBeFalse()
            ->and(Gate::forUser(ClientModel::factory()->create())->allows('viewAny', BrandModel::class))->toBeFalse();
    });
});
