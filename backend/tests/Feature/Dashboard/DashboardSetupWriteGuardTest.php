<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

/** S3 (F-01 setup group): branch, chair, floor plan, service, stylist and hours writes obey the write guard. */
function setupWorld(BrandStatusEnum $brand = BrandStatusEnum::Active, BranchStatusEnum $branch = BranchStatusEnum::Enabled): array
{
    $owner = ClientModel::factory()->create();
    $brandModel = BrandModel::factory()->create(['owner_id' => $owner->id, 'status' => $brand]);
    $branchModel = BranchModel::factory()->create(['brand_id' => $brandModel->id, 'status' => $branch]);

    $stylist = BarberModel::factory()->create(['managed_by_branch_id' => $branchModel->id]);

    return [
        'owner' => $owner,
        'branch' => $branchModel,
        'chair' => ChairModel::factory()->create(['branch_id' => $branchModel->id, 'barber_id' => $stylist->id]),
        'stylist' => $stylist,
        'service' => OfferedServiceModel::factory()->create(['serviceable_id' => $brandModel->id, 'serviceable_type' => ServiceableTypeEnum::Brand]),
    ];
}

/** @return array<string, array{0: string, 1: Closure(array<string, mixed>): string, 2: Closure(array<string, mixed>): array<string, mixed>}> */
function setupWriteRoutes(): array
{
    $base = '/api/v1/dashboard';

    return [
        'update branch' => ['PUT', fn (array $w) => "{$base}/branches/{$w['branch']->id}", fn (array $w) => ['name' => ['en' => 'Renamed', 'ar' => 'اسم'], 'brand_id' => $w['branch']->brand_id, 'email' => 'renamed-branch@example.test']],
        'delete branch' => ['DELETE', fn (array $w) => "{$base}/branches/{$w['branch']->id}", fn () => []],
        'opening hours' => ['PUT', fn (array $w) => "{$base}/branches/{$w['branch']->id}/opening-hours", fn () => ['hours' => [['day_of_week' => 0, 'is_closed' => true]]]],
        'clear hours override' => ['DELETE', fn (array $w) => "{$base}/branches/{$w['branch']->id}/hours-overrides/2030-01-01", fn () => []],
        'floor plan' => ['PATCH', fn (array $w) => "{$base}/branches/{$w['branch']->id}/floor-plan", fn () => ['preset' => 'compact']],
        'switch off' => ['PATCH', fn (array $w) => "{$base}/branches/{$w['branch']->id}/switch-off", fn () => []],
        'create chair' => ['POST', fn () => "{$base}/chairs", fn (array $w) => chairWritePayload($w)],
        'update chair' => ['PUT', fn (array $w) => "{$base}/chairs/{$w['chair']->id}", fn (array $w) => chairWritePayload($w)],
        'delete chair' => ['DELETE', fn (array $w) => "{$base}/chairs/{$w['chair']->id}", fn () => []],
        'delete stylist' => ['DELETE', fn (array $w) => "{$base}/stylists/{$w['stylist']->id}", fn () => []],
        'activate stylist' => ['PATCH', fn (array $w) => "{$base}/stylists/{$w['stylist']->id}/activate", fn () => []],
        'deactivate stylist' => ['PATCH', fn (array $w) => "{$base}/stylists/{$w['stylist']->id}/deactivate", fn () => []],
        'delete service' => ['DELETE', fn (array $w) => "{$base}/services/{$w['service']->id}", fn () => []],
        'create service' => ['POST', fn () => "{$base}/services", fn (array $w) => serviceWritePayload($w)],
        'update service' => ['PUT', fn (array $w) => "{$base}/services/{$w['service']->id}", fn (array $w) => serviceWritePayload($w)],
    ];
}

function chairWritePayload(array $world): array
{
    return [
        'branch_id' => $world['branch']->id,
        'barber_id' => null,
        'label' => 'Z-01',
        'floor_zone' => $world['chair']->floor_zone?->value ?? 'shared',
        'status' => $world['chair']->status->value,
        'layout_settings' => ['position_x' => 10, 'position_y' => 10, 'width' => 60, 'height' => 60],
    ];
}

function serviceWritePayload(array $world): array
{
    return [
        'serviceable_id' => $world['branch']->brand_id,
        'serviceable_type' => ServiceableTypeEnum::Brand->value,
        'catalog_item_id' => null,
        'currency_code' => CurrencyModel::factory()->create()->code,
        'name' => ['en' => 'Haircut', 'ar' => 'قص شعر'],
        'price_amount_minor' => 2500,
        'duration_minutes' => 30,
        'is_active' => true,
    ];
}

describe('Setup writes on a Suspended brand or branch (F-01, S3)', function (): void {
    it('refuses every setup write on a Suspended brand for the owner and the manager', function (string $route, string $actor): void {
        [$method, $url, $payload] = setupWriteRoutes()[$route];
        $world = setupWorld(BrandStatusEnum::Suspended);
        $this->authenticateDashboardActor($actor === 'owner' ? $world['owner'] : $world['branch']);

        $response = $this->json($method, $url($world), $payload($world))->assertForbidden();
        // A manager may already be refused by the role policy (for example branch delete); the owner always reaches the guard.
        if ($actor === 'owner') {
            $response->assertJsonPath('code', 'brand_suspended');
        }
    })->with(fn () => array_keys(setupWriteRoutes()))->with(['owner', 'manager']);

    it('refuses every setup write on a Suspended branch of an active brand with branch_read_only', function (string $route): void {
        [$method, $url, $payload] = setupWriteRoutes()[$route];
        $world = setupWorld(branch: BranchStatusEnum::Suspended);
        $this->authenticateDashboardActor($world['owner']);

        $this->json($method, $url($world), $payload($world))
            ->assertForbidden()
            ->assertJsonPath('code', 'branch_read_only');
    })->with(fn () => array_values(array_diff(array_keys(setupWriteRoutes()), ['create service', 'update service', 'delete service'])));

    it('refuses creating a branch and a chair-assigned stylist under a Suspended brand', function (): void {
        $world = setupWorld(BrandStatusEnum::Suspended);
        $this->authenticateDashboardActor($world['owner']);

        $this->postJson('/api/v1/dashboard/branches', [
            'brand_id' => $world['branch']->brand_id,
            'name' => ['en' => 'New', 'ar' => 'جديد'],
            'email' => 'new-branch@example.test',
            'password' => 'a-secure-owner-created-password',
        ])->assertForbidden()->assertJsonPath('code', 'brand_suspended');
        $this->postJson('/api/v1/dashboard/stylists', [
            'chair_id' => $world['chair']->id,
            'name' => ['en' => 'Sam', 'ar' => 'سام'],
            'email' => 'new-stylist@example.test',
            'password' => 'a-secure-stylist-password-1',
        ])->assertForbidden()->assertJsonPath('code', 'brand_suspended');
    });

    it('keeps a Disabled branch writable for setup (D9)', function (): void {
        $world = setupWorld(branch: BranchStatusEnum::Disabled);
        $this->authenticateDashboardActor($world['owner']);

        $this->deleteJson("/api/v1/dashboard/chairs/{$world['chair']->id}")->assertOk();
    });

    it('lets the platform admin write on a Suspended brand and branch', function (): void {
        $world = setupWorld(BrandStatusEnum::Suspended, BranchStatusEnum::Suspended);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->deleteJson("/api/v1/dashboard/chairs/{$world['chair']->id}")->assertOk();
    });

    it('keeps reads working on a Suspended brand', function (): void {
        $world = setupWorld(BrandStatusEnum::Suspended);
        $this->authenticateDashboardActor($world['owner']);

        $this->getJson("/api/v1/dashboard/chairs/{$world['chair']->id}")->assertOk();
    });
});
