<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Gate;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Commission\Models\CommissionRuleModel;
use Modules\Payment\Models\PaymentGatewayModel;
use Modules\Payout\Models\PayoutModel;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;

dataset('monetization models', [
    'plan' => [SubscriptionPlanModel::class],
    'subscription' => [BrandSubscriptionModel::class],
    'gateway' => [PaymentGatewayModel::class],
    'rule' => [CommissionRuleModel::class],
    'entry' => [CommissionEntryModel::class],
    'payout' => [PayoutModel::class],
]);

describe('Monetization policies', function (): void {
    it('allow platform admins to view and create :dataset', function (string $model): void {
        $admin = AdminModel::factory()->create();

        expect(Gate::forUser($admin)->allows('viewAny', $model))->toBeTrue()
            ->and(Gate::forUser($admin)->allows('create', $model))->toBeTrue();
    })->with('monetization models');

    it('deny branches and clients every ability on :dataset', function (string $model): void {
        foreach ([BranchModel::factory()->create(), ClientModel::factory()->create()] as $actor) {
            expect(Gate::forUser($actor)->denies('viewAny', $model))->toBeTrue()
                ->and(Gate::forUser($actor)->denies('create', $model))->toBeTrue();
        }
    })->with('monetization models');

    it('check instance abilities for admins and deny branches', function (): void {
        $admin = AdminModel::factory()->create();
        $branch = BranchModel::factory()->create();
        $abilities = [
            [SubscriptionPlanModel::factory()->create(), ['view', 'update', 'delete']],
            [PaymentGatewayModel::factory()->create(), ['view', 'update', 'delete']],
            [CommissionRuleModel::factory()->create(), ['update', 'delete']],
            [PayoutModel::factory()->create(), ['view', 'update']],
        ];

        foreach ($abilities as [$record, $names]) {
            foreach ($names as $ability) {
                expect(Gate::forUser($admin)->allows($ability, $record))->toBeTrue()
                    ->and(Gate::forUser($branch)->denies($ability, $record))->toBeTrue();
            }
        }
    });
});
