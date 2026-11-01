<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;

function flags(BrandModel $brand, array $flags): void
{
    app(BrandFeatures::class)->set($brand, $flags);
}

function dashboardBranchPayload(BrandModel $brand, string $email): array
{
    return [
        'brand_id' => $brand->id,
        'name' => ['en' => 'Second', 'ar' => 'الثاني'],
        'email' => $email,
        'password' => 'branch-password-123',
    ];
}

function jobPayload(): array
{
    return [
        'title' => ['en' => 'Senior barber', 'ar' => 'حلاق أول'],
        'description' => ['en' => 'Join us', 'ar' => 'انضم إلينا'],
    ];
}

describe('multi_branch (A3)', function (): void {
    it('blocks a second branch until the flag is on', function (): void {
        $brand = BrandModel::factory()->create();
        BranchModel::factory()->create(['brand_id' => $brand->id]);
        $admin = AdminModel::factory()->create();

        $this->authenticateDashboardActor($admin)
            ->postJson('/api/v1/dashboard/branches', dashboardBranchPayload($brand, 'second@example.test'))
            ->assertForbidden()
            ->assertJsonPath('code', 'feature_not_enabled')
            ->assertJsonPath('errors.feature.0', 'multi_branch');

        flags($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => true]);

        $this->authenticateDashboardActor($admin)
            ->postJson('/api/v1/dashboard/branches', dashboardBranchPayload($brand, 'second@example.test'))
            ->assertCreated();
    });

    it('keeps every branch after a downgrade but blocks adding another', function (): void {
        $brand = BrandModel::factory()->create();
        flags($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => true]);
        BranchModel::factory()->count(3)->create(['brand_id' => $brand->id]);
        flags($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => false]);

        $this->authenticateDashboardActor(AdminModel::factory()->create())
            ->postJson('/api/v1/dashboard/branches', dashboardBranchPayload($brand, 'fourth@example.test'))
            ->assertForbidden()
            ->assertJsonPath('code', 'feature_not_enabled');

        expect(BranchModel::query()->where('brand_id', $brand->id)->count())->toBe(3);
    });

    it('makes extra branches read-only after a downgrade but keeps the original manageable', function (): void {
        $brand = BrandModel::factory()->create();
        flags($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => true]);
        $original = BranchModel::factory()->create(['brand_id' => $brand->id, 'created_at' => now()->subDays(2)]);
        $extra = BranchModel::factory()->create(['brand_id' => $brand->id, 'created_at' => now()->subDay()]);
        flags($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => false]);
        $admin = AdminModel::factory()->create();
        $chair = fn (BranchModel $branch): array => [
            'branch_id' => $branch->id, 'label' => 'C1', 'floor_zone' => 'shared', 'status' => ChairStatus::Available,
            'ui_metadata' => ['position_x' => 0, 'position_y' => 0, 'width' => 1, 'height' => 1],
        ];

        $this->authenticateDashboardActor($admin)->postJson('/api/v1/dashboard/chairs', $chair($extra))
            ->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');
        $this->authenticateDashboardActor($admin)->postJson('/api/v1/dashboard/chairs', $chair($original))
            ->assertCreated();

        expect(ChairModel::query()->where('branch_id', $extra->id)->count())->toBe(0);
        $this->getJson("/api/v1/explore/branches/{$extra->id}")->assertOk();
    });

    it('never gates a brand\'s first branch', function (): void {
        $this->actingAs(ClientModel::factory()->create(), 'client')
            ->postJson('/api/v1/brands', ['name' => ['en' => 'Solo', 'ar' => 'سولو'], 'base_currency_id' => CurrencyModel::factory()->create()->id])
            ->assertCreated();
    });
});

describe('job_board (G1)', function (): void {
    it('blocks job postings until the flag is on', function (): void {
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api');

        $this->postJson('/api/v1/branch/job-postings', jobPayload())
            ->assertForbidden()
            ->assertJsonPath('code', 'feature_not_enabled')
            ->assertJsonPath('errors.feature.0', 'job_board');

        flags($branch->brand, [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => true]);

        $this->postJson('/api/v1/branch/job-postings', jobPayload())->assertCreated();
    });
});

describe('admin feature API (H6)', function (): void {
    it('lets only admins read and change the flags', function (): void {
        $brand = BrandModel::factory()->create();

        $this->patchJson("/api/v1/admin/brands/{$brand->id}/features", ['job_board' => true])->assertUnauthorized();
        $this->withToken(BranchModel::factory()->create()->createToken('t')->plainTextToken)
            ->patchJson("/api/v1/admin/brands/{$brand->id}/features", ['job_board' => true])
            ->assertUnauthorized();
        app('auth')->forgetGuards();

        $admin = AdminModel::factory()->create();
        $this->withToken($admin->createToken('t')->plainTextToken)
            ->patchJson("/api/v1/admin/brands/{$brand->id}/features", ['job_board' => true])
            ->assertOk()
            ->assertJsonPath('data.job_board', true)
            ->assertJsonPath('data.multi_branch', false);

        expect(app(BrandFeatures::class)->enabled($brand, BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD))->toBeTrue();

        $this->withToken($admin->createToken('t2')->plainTextToken)
            ->getJson("/api/v1/admin/brands/{$brand->id}/features")
            ->assertOk()
            ->assertJsonPath('data.job_board', true);
    });

    it('exposes the flags on the brand resource', function (): void {
        $brand = BrandModel::factory()->create();
        flags($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => true]);

        $this->getJson("/api/v1/brands/{$brand->id}")
            ->assertOk()
            ->assertJsonPath('data.features.multi_branch', true)
            ->assertJsonPath('data.features.job_board', false);
    });
});
