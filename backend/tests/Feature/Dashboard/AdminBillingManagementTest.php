<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Payout\CQRS\Command\TransitionPayoutCommand;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Payout\Handlers\TransitionPayoutHandler;
use Modules\Payout\Models\PayoutModel;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Handlers\UpdateSubscriptionStatusHandler;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;

/** Module 9: the dashboard admin screens for payout approval and subscription plans lean on these contracts. */
describe('Admin payout, plan and subscription routes are platform-admin only', function (): void {
    it('rejects anonymous callers', function (string $method, string $path): void {
        $this->json($method, "/api/v1/dashboard/admin/{$path}")->assertUnauthorized();
    })->with([
        ['GET', 'payouts'],
        ['POST', 'payouts/generate'],
        ['GET', 'subscription-plans'],
        ['GET', 'subscriptions'],
    ]);

    it('rejects branch managers, stylists and brand owners', function (): void {
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        $payout = PayoutModel::factory()->create();
        $subscription = BrandSubscriptionModel::factory()->create();

        foreach ([BranchModel::factory()->create(), BarberModel::factory()->create(), $owner] as $actor) {
            $this->authenticateDashboardActor($actor);
            $this->getJson('/api/v1/dashboard/admin/payouts')->assertForbidden();
            $this->postJson('/api/v1/dashboard/admin/payouts/generate')->assertForbidden();
            $this->patchJson("/api/v1/dashboard/admin/payouts/{$payout->id}/approve")->assertForbidden();
            $this->getJson('/api/v1/dashboard/admin/subscription-plans')->assertForbidden();
            $this->postJson('/api/v1/dashboard/admin/subscription-plans', [])->assertForbidden();
            $this->getJson('/api/v1/dashboard/admin/subscriptions')->assertForbidden();
            $this->patchJson("/api/v1/dashboard/admin/subscriptions/{$subscription->id}/status", ['status' => 'active'])->assertForbidden();
        }

        expect($payout->fresh()->status)->toBe(PayoutStatus::Draft);
    });
});

describe('Admin list filters', function (): void {
    beforeEach(function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
    });

    it('filters subscriptions by status and rejects an unknown status', function (): void {
        $active = BrandSubscriptionModel::factory()->create(['status' => SubscriptionStatus::Active]);
        BrandSubscriptionModel::factory()->create(['status' => SubscriptionStatus::Cancelled]);

        $this->getJson('/api/v1/dashboard/admin/subscriptions?status=active')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $active->id);
        $this->getJson('/api/v1/dashboard/admin/subscriptions?status=bogus')->assertUnprocessable();
        $this->getJson('/api/v1/dashboard/admin/subscriptions?per_page=0')->assertUnprocessable();
    });

    it('filters plans by active flag', function (): void {
        $active = SubscriptionPlanModel::factory()->create(['is_active' => true]);
        SubscriptionPlanModel::factory()->create(['is_active' => false]);

        $this->getJson('/api/v1/dashboard/admin/subscription-plans')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/dashboard/admin/subscription-plans?is_active=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $active->id);
        $this->getJson('/api/v1/dashboard/admin/subscription-plans?is_active=0')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/dashboard/admin/subscription-plans?is_active=maybe')->assertUnprocessable();
    });

    it('answers 404 for a payout, plan or subscription that does not exist', function (): void {
        $missing = fake()->uuid();

        $this->getJson("/api/v1/dashboard/admin/payouts/{$missing}")->assertNotFound();
        $this->patchJson("/api/v1/dashboard/admin/payouts/{$missing}/approve")->assertNotFound();
        $this->getJson("/api/v1/dashboard/admin/subscription-plans/{$missing}")->assertNotFound();
        $this->patchJson("/api/v1/dashboard/admin/subscriptions/{$missing}/status", ['status' => 'active'])->assertNotFound();
    });
});

describe('Status changes re-check the state under a lock', function (): void {
    it('refuses a payout move based on a stale copy', function (): void {
        $admin = AdminModel::factory()->create();
        $payout = PayoutModel::factory()->create();
        $stale = PayoutModel::query()->findOrFail($payout->id);

        PayoutModel::query()->whereKey($payout->id)->update(['status' => PayoutStatus::Cancelled]);

        $result = app(TransitionPayoutHandler::class)->handle($stale, new TransitionPayoutCommand(PayoutStatus::Approved, $admin->id, null, null));

        expect($result)->toBeNull()
            ->and($payout->fresh()->status)->toBe(PayoutStatus::Cancelled)
            ->and($payout->fresh()->approved_at)->toBeNull();
    });

    it('refuses a subscription move based on a stale copy', function (): void {
        $subscription = BrandSubscriptionModel::factory()->create(['status' => SubscriptionStatus::Active]);
        $stale = BrandSubscriptionModel::query()->findOrFail($subscription->id);

        BrandSubscriptionModel::query()->whereKey($subscription->id)->update(['status' => SubscriptionStatus::Cancelled]);

        $result = app(UpdateSubscriptionStatusHandler::class)->handle($stale, SubscriptionStatus::PastDue);

        expect($result)->toBeNull()
            ->and($subscription->fresh()->status)->toBe(SubscriptionStatus::Cancelled);
    });
});
