<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Currency\Models\CurrencyModel;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;

function planPayload(array $overrides = []): array
{
    return [
        'name' => ['en' => 'Pro', 'ar' => 'محترف'],
        'description' => ['en' => 'For growing brands', 'ar' => 'للعلامات النامية'],
        'price_amount_minor' => 4900,
        'currency_code' => CurrencyModel::factory()->create()->code,
        'interval_unit' => 'month',
        'interval_count' => 1,
        'is_active' => true,
        'feature_keys' => [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH],
        ...$overrides,
    ];
}

describe('Subscription plans', function (): void {
    beforeEach(function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
    });

    it('creates a plan with money as minor units and mapped features', function (): void {
        $this->postJson('/api/v1/dashboard/admin/subscription-plans', planPayload())
            ->assertCreated()
            ->assertJsonPath('data.price_amount_minor', 4900)
            ->assertJsonPath('data.interval_unit', 'month')
            ->assertJsonPath('data.feature_keys', [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH]);

        expect(SubscriptionPlanModel::query()->count())->toBe(1);
        $this->assertDatabaseHas('plan_features', ['feature_key' => BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH]);
    });

    it('validates fields, interval unit and unknown feature keys', function (): void {
        $this->postJson('/api/v1/dashboard/admin/subscription-plans', [])->assertUnprocessable();
        $this->postJson('/api/v1/dashboard/admin/subscription-plans', planPayload(['interval_unit' => 'fortnight']))->assertUnprocessable();
        $this->postJson('/api/v1/dashboard/admin/subscription-plans', planPayload(['feature_keys' => ['teleport']]))->assertUnprocessable();
        $this->postJson('/api/v1/dashboard/admin/subscription-plans', planPayload(['price_amount_minor' => -1]))->assertUnprocessable();
    });

    it('updates a plan and re-maps its features', function (): void {
        $plan = SubscriptionPlanModel::factory()->create();
        $plan->features()->create(['feature_key' => BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH]);

        $this->putJson("/api/v1/dashboard/admin/subscription-plans/{$plan->id}", planPayload([
            'price_amount_minor' => 9900,
            'currency_code' => $plan->currency_code,
            'feature_keys' => [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD],
        ]))
            ->assertOk()
            ->assertJsonPath('data.price_amount_minor', 9900)
            ->assertJsonPath('data.feature_keys', [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD]);

        $this->assertDatabaseMissing('plan_features', ['plan_id' => $plan->id, 'feature_key' => BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH]);
    });

    it('lists and shows plans', function (): void {
        $plan = SubscriptionPlanModel::factory()->create();

        $this->getJson('/api/v1/dashboard/admin/subscription-plans')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.pagination.total', 1);
        $this->getJson("/api/v1/dashboard/admin/subscription-plans/{$plan->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $plan->id);
    });

    it('deletes an unused plan but keeps one with live subscriptions', function (): void {
        $unused = SubscriptionPlanModel::factory()->create();
        $used = SubscriptionPlanModel::factory()->create();
        BrandSubscriptionModel::factory()->create(['plan_id' => $used->id]);

        $this->deleteJson("/api/v1/dashboard/admin/subscription-plans/{$unused->id}")->assertOk();
        $this->deleteJson("/api/v1/dashboard/admin/subscription-plans/{$used->id}")->assertConflict();

        expect(SubscriptionPlanModel::query()->count())->toBe(1);
    });

    it('lists the feature keys a plan may map to', function (): void {
        $this->getJson('/api/v1/dashboard/admin/plan-feature-keys')
            ->assertOk()
            ->assertJsonPath('data', BrandFeatures::keys());
    });
});

describe('Brand subscriptions', function (): void {
    beforeEach(function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
    });

    it('assigning a plan switches the mapped flags on and every other flag off', function (): void {
        $brand = BrandModel::factory()->create();
        app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => true]);
        $plan = SubscriptionPlanModel::factory()->create();
        $plan->features()->create(['feature_key' => BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH]);

        $this->postJson('/api/v1/dashboard/admin/subscriptions', ['brand_id' => $brand->id, 'plan_id' => $plan->id])
            ->assertCreated()
            ->assertJsonPath('data.status', SubscriptionStatus::Active->value);

        expect(app(BrandFeatures::class)->all($brand))->toBe([
            BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => true,
            BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => false,
        ]);
    });

    it('replaces the previous live subscription of the brand', function (): void {
        $brand = BrandModel::factory()->create();
        $old = BrandSubscriptionModel::factory()->create(['brand_id' => $brand->id]);
        $plan = SubscriptionPlanModel::factory()->create();

        $this->postJson('/api/v1/dashboard/admin/subscriptions', ['brand_id' => $brand->id, 'plan_id' => $plan->id])->assertCreated();

        expect($old->fresh()->status)->toBe(SubscriptionStatus::Cancelled);
    });

    it('refuses an inactive or deleted plan and unknown brand', function (): void {
        $brand = BrandModel::factory()->create();
        $inactive = SubscriptionPlanModel::factory()->create(['is_active' => false]);
        $deleted = SubscriptionPlanModel::factory()->create();
        $deleted->delete();

        $this->postJson('/api/v1/dashboard/admin/subscriptions', ['brand_id' => $brand->id, 'plan_id' => $inactive->id])->assertUnprocessable();
        $this->postJson('/api/v1/dashboard/admin/subscriptions', ['brand_id' => $brand->id, 'plan_id' => $deleted->id])->assertUnprocessable();
        $this->postJson('/api/v1/dashboard/admin/subscriptions', ['brand_id' => fake()->uuid(), 'plan_id' => $inactive->id])->assertUnprocessable();
    });

    it('lists subscriptions, optionally by brand', function (): void {
        $mine = BrandSubscriptionModel::factory()->create();
        BrandSubscriptionModel::factory()->create();

        $this->getJson('/api/v1/dashboard/admin/subscriptions')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson("/api/v1/dashboard/admin/subscriptions?brand_id={$mine->brand_id}")->assertOk()->assertJsonCount(1, 'data');
    });

    it('moves through the state machine and revokes features on cancel', function (): void {
        $brand = BrandModel::factory()->create();
        $plan = SubscriptionPlanModel::factory()->create();
        $plan->features()->create(['feature_key' => BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH]);
        $subscription = BrandSubscriptionModel::factory()->create(['brand_id' => $brand->id, 'plan_id' => $plan->id]);
        $url = "/api/v1/dashboard/admin/subscriptions/{$subscription->id}/status";

        $this->patchJson($url, ['status' => SubscriptionStatus::PastDue])->assertOk()->assertJsonPath('data.status', SubscriptionStatus::PastDue->value);
        $this->patchJson($url, ['status' => SubscriptionStatus::Active])->assertOk();
        $this->patchJson($url, ['status' => SubscriptionStatus::Pending])->assertConflict();
        $this->patchJson($url, ['status' => 'bogus'])->assertUnprocessable();

        app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => true]);
        $this->patchJson($url, ['status' => SubscriptionStatus::Cancelled])->assertOk()->assertJsonPath('data.status', SubscriptionStatus::Cancelled->value);

        expect(app(BrandFeatures::class)->enabled($brand, BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH))->toBeFalse();
        $this->patchJson($url, ['status' => SubscriptionStatus::Active])->assertConflict();
    });

    it('activates a pending subscription and grants its features', function (): void {
        $brand = BrandModel::factory()->create();
        $plan = SubscriptionPlanModel::factory()->create();
        $plan->features()->create(['feature_key' => BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD]);
        $subscription = BrandSubscriptionModel::factory()->create([
            'brand_id' => $brand->id, 'plan_id' => $plan->id, 'status' => SubscriptionStatus::Pending,
        ]);

        $this->patchJson("/api/v1/dashboard/admin/subscriptions/{$subscription->id}/status", ['status' => SubscriptionStatus::Active])->assertOk();

        expect(app(BrandFeatures::class)->enabled($brand, BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD))->toBeTrue();
    });
});
