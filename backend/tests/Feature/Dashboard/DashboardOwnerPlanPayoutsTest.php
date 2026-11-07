<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Payout\Models\PayoutModel;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\PlanFeatureModel;
use Modules\Subscription\Models\SubscriptionPlanModel;

function ownerWithBrandOnly(): array
{
    $owner = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);

    return [$owner, $brand];
}

describe('GET /dashboard/subscription', function (): void {
    it('shows an owner the current plan of each own brand and nothing else', function (): void {
        [$owner, $brand] = ownerWithBrandOnly();
        $plan = SubscriptionPlanModel::factory()->create(['price_amount_minor' => 4900]);
        PlanFeatureModel::query()->create(['plan_id' => $plan->id, 'feature_key' => 'multi_branch']);
        BrandSubscriptionModel::factory()->create(['brand_id' => $brand->id, 'plan_id' => $plan->id, 'status' => SubscriptionStatus::Active]);
        BrandSubscriptionModel::factory()->create();

        $this->authenticateDashboardActor($owner)
            ->getJson('/api/v1/dashboard/subscription')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.brand.id', $brand->id)
            ->assertJsonPath('data.0.plan.price_amount_minor', 4900)
            ->assertJsonPath('data.0.plan.feature_keys', ['multi_branch'])
            ->assertJsonStructure(['data' => [['status', 'features' => ['multi_branch', 'job_board'], 'grace_ends_at']]]);
    });

    it('is forbidden to managers, stylists and anonymous callers', function (): void {
        $this->getJson('/api/v1/dashboard/subscription')->assertUnauthorized();
        $this->authenticateDashboardActor(BranchModel::factory()->create())->getJson('/api/v1/dashboard/subscription')->assertForbidden();
        $this->authenticateDashboardActor(BarberModel::factory()->create())->getJson('/api/v1/dashboard/subscription')->assertForbidden();
    });
});

describe('GET /dashboard/payouts', function (): void {
    it('lists only the owner\'s own non-draft payouts without internal notes', function (): void {
        [$owner, $brand] = ownerWithBrandOnly();
        $approved = PayoutModel::factory()->create(['brand_id' => $brand->id, 'status' => PayoutStatus::Approved, 'notes' => 'internal']);
        PayoutModel::factory()->create(['brand_id' => $brand->id, 'status' => PayoutStatus::Draft]);
        PayoutModel::factory()->create(['status' => PayoutStatus::Paid]);

        $this->authenticateDashboardActor($owner)
            ->getJson('/api/v1/dashboard/payouts')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $approved->id)
            ->assertJsonMissingPath('data.0.notes');
    });

    it('filters by status', function (): void {
        [$owner, $brand] = ownerWithBrandOnly();
        PayoutModel::factory()->create(['brand_id' => $brand->id, 'status' => PayoutStatus::Approved]);
        $paid = PayoutModel::factory()->create(['brand_id' => $brand->id, 'status' => PayoutStatus::Paid]);

        $this->authenticateDashboardActor($owner)
            ->getJson('/api/v1/dashboard/payouts?status=paid')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $paid->id);
    });

    it('pages newest first with pagination meta and the brand name', function (): void {
        [$owner, $brand] = ownerWithBrandOnly();
        $older = PayoutModel::factory()->create(['brand_id' => $brand->id, 'status' => PayoutStatus::Paid, 'created_at' => now()->subDays(2)]);
        $newer = PayoutModel::factory()->create(['brand_id' => $brand->id, 'status' => PayoutStatus::Approved, 'created_at' => now()->subDay()]);

        $this->authenticateDashboardActor($owner)
            ->getJson('/api/v1/dashboard/payouts?per_page=1')
            ->assertOk()
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.0.brand.id', $brand->id)
            ->assertJsonPath('meta.pagination.total', 2)
            ->assertJsonPath('meta.pagination.total_pages', 2);

        $this->authenticateDashboardActor($owner)
            ->getJson('/api/v1/dashboard/payouts?per_page=1&page=2')
            ->assertJsonPath('data.0.id', $older->id);
    });

    it('rejects an unknown status filter', function (): void {
        [$owner] = ownerWithBrandOnly();

        $this->authenticateDashboardActor($owner)->getJson('/api/v1/dashboard/payouts?status=bogus')->assertUnprocessable();
    });

    it('is forbidden to managers and stylists', function (): void {
        $this->getJson('/api/v1/dashboard/payouts')->assertUnauthorized();
        $this->authenticateDashboardActor(BranchModel::factory()->create())->getJson('/api/v1/dashboard/payouts')->assertForbidden();
        $this->authenticateDashboardActor(BarberModel::factory()->create())->getJson('/api/v1/dashboard/payouts')->assertForbidden();
    });
});
