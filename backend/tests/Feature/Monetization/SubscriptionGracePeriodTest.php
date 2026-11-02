<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;

function graceSubscription(int $pastDueDaysAgo): BrandSubscriptionModel
{
    $brand = BrandModel::factory()->create();
    $plan = SubscriptionPlanModel::factory()->create();
    $plan->features()->create(['feature_key' => BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH]);
    app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => true]);

    return BrandSubscriptionModel::factory()->create([
        'brand_id' => $brand->id,
        'plan_id' => $plan->id,
        'status' => SubscriptionStatus::PastDue,
        'past_due_at' => now()->subDays($pastDueDaysAgo),
    ]);
}

function setGraceDays(int $days): void
{
    app(SettingsService::class)->update([SettingKey::SubscriptionGraceDays->value => $days]);
}

function multiBranchEnabled(BrandSubscriptionModel $subscription): bool
{
    return app(BrandFeatures::class)->enabled($subscription->brand, BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH);
}

describe('Subscription grace period', function (): void {
    it('defaults to the documented grace days and enforces its bounds', function (): void {
        expect(app(SettingsService::class)->int(SettingKey::SubscriptionGraceDays))
            ->toBe(SettingKey::SubscriptionGraceDays->default());

        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $url = '/api/v1/dashboard/admin/settings';

        $this->patchJson($url, ['settings' => [SettingKey::SubscriptionGraceDays->value => SettingKey::SubscriptionGraceDays->max() + 1]])->assertUnprocessable();
        $this->patchJson($url, ['settings' => [SettingKey::SubscriptionGraceDays->value => SettingKey::SubscriptionGraceDays->min() - 1]])->assertUnprocessable();
        $this->patchJson($url, ['settings' => [SettingKey::SubscriptionGraceDays->value => SettingKey::SubscriptionGraceDays->max()]])->assertOk();
        expect(app(SettingsService::class)->int(SettingKey::SubscriptionGraceDays))->toBe(SettingKey::SubscriptionGraceDays->max());
    });

    it('stamps past_due_at on the transition and clears it on recovery', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $subscription = BrandSubscriptionModel::factory()->create();
        $url = "/api/v1/dashboard/admin/subscriptions/{$subscription->id}/status";

        $this->patchJson($url, ['status' => SubscriptionStatus::PastDue->value])
            ->assertOk()
            ->assertJsonPath('data.past_due_at', fn ($value) => $value !== null)
            ->assertJsonPath('data.grace_ends_at', fn ($value) => $value !== null);

        $this->patchJson($url, ['status' => SubscriptionStatus::Active->value])
            ->assertOk()
            ->assertJsonPath('data.past_due_at', null)
            ->assertJsonPath('data.grace_ends_at', null);
    });

    it('keeps features while the grace window is open', function (): void {
        setGraceDays(7);
        $subscription = graceSubscription(pastDueDaysAgo: 6);

        $this->artisan('subscriptions:expire-past-due')->assertSuccessful();

        expect($subscription->fresh()->status)->toBe(SubscriptionStatus::PastDue)
            ->and(multiBranchEnabled($subscription))->toBeTrue()
            ->and($subscription->fresh()->isGraceExpired())->toBeFalse();
    });

    it('cancels the subscription and revokes features once the grace window passes', function (): void {
        setGraceDays(7);
        $subscription = graceSubscription(pastDueDaysAgo: 8);

        $this->artisan('subscriptions:expire-past-due')->assertSuccessful();

        $fresh = $subscription->fresh();
        expect($fresh->status)->toBe(SubscriptionStatus::Cancelled)
            ->and($fresh->cancelled_at)->not->toBeNull()
            ->and(multiBranchEnabled($subscription))->toBeFalse();
    });

    it('applies a changed grace setting to existing past_due subscriptions', function (): void {
        setGraceDays(30);
        $subscription = graceSubscription(pastDueDaysAgo: 10);
        $this->artisan('subscriptions:expire-past-due')->assertSuccessful();
        expect($subscription->fresh()->status)->toBe(SubscriptionStatus::PastDue);

        setGraceDays(5);
        $this->artisan('subscriptions:expire-past-due')->assertSuccessful();
        expect($subscription->fresh()->status)->toBe(SubscriptionStatus::Cancelled);
    });

    it('revokes immediately when the grace period is zero', function (): void {
        setGraceDays(SettingKey::SubscriptionGraceDays->min());
        $subscription = graceSubscription(pastDueDaysAgo: 0);

        $this->artisan('subscriptions:expire-past-due')->assertSuccessful();

        expect($subscription->fresh()->status)->toBe(SubscriptionStatus::Cancelled)
            ->and(multiBranchEnabled($subscription))->toBeFalse();
    });

    it('never touches active or already cancelled subscriptions', function (): void {
        setGraceDays(SettingKey::SubscriptionGraceDays->min());
        $active = BrandSubscriptionModel::factory()->create();
        $cancelled = BrandSubscriptionModel::factory()->create(['status' => SubscriptionStatus::Cancelled]);

        $this->artisan('subscriptions:expire-past-due')->assertSuccessful();

        expect($active->fresh()->status)->toBe(SubscriptionStatus::Active)
            ->and($cancelled->fresh()->status)->toBe(SubscriptionStatus::Cancelled);
    });
});
