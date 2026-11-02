<?php

declare(strict_types=1);

namespace Modules\Subscription\Handlers;

use Illuminate\Support\Facades\DB;
use Modules\Brand\Models\BrandModel;
use Modules\Subscription\CQRS\Command\AssignSubscriptionCommand;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;
use Modules\Subscription\Services\PlanFeatureSyncer;

final class AssignSubscriptionHandler
{
    public function __construct(private readonly PlanFeatureSyncer $syncer) {}

    /** Replaces the brand's live subscription with an active one on the plan. */
    public function handle(AssignSubscriptionCommand $command): BrandSubscriptionModel
    {
        return DB::transaction(function () use ($command): BrandSubscriptionModel {
            $brand = BrandModel::query()->findOrFail($command->brandId);
            $plan = SubscriptionPlanModel::query()->findOrFail($command->planId);

            BrandSubscriptionModel::query()
                ->where('brand_id', $brand->getKey())
                ->whereIn('status', SubscriptionStatus::live())
                ->update(['status' => SubscriptionStatus::Cancelled, 'cancelled_at' => now()]);

            $start = now();
            $subscription = BrandSubscriptionModel::create([
                'brand_id' => $brand->getKey(),
                'plan_id' => $plan->getKey(),
                'status' => SubscriptionStatus::Active,
                'starts_at' => $start,
                'ends_at' => $start->copy()->add($plan->interval_unit->value, $plan->interval_count),
            ]);

            $this->syncer->grant($brand, $plan);

            return $subscription->load(['brand', 'plan']);
        });
    }
}
