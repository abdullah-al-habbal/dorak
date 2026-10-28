<?php

declare(strict_types=1);

namespace Modules\Subscription\Handlers;

use Illuminate\Support\Facades\DB;
use Modules\Subscription\CQRS\Command\SavePlanCommand;
use Modules\Subscription\Models\SubscriptionPlanModel;

final class SavePlanHandler
{
    public function handle(SavePlanCommand $command, ?SubscriptionPlanModel $plan = null): SubscriptionPlanModel
    {
        return DB::transaction(function () use ($command, $plan): SubscriptionPlanModel {
            $attributes = [
                'name' => $command->name,
                'description' => $command->description,
                'price_minor' => $command->priceMinor,
                'currency_id' => $command->currencyId,
                'interval_unit' => $command->intervalUnit,
                'interval_count' => $command->intervalCount,
                'is_active' => $command->isActive,
                'sort_order' => $command->sortOrder,
            ];

            $plan === null ? $plan = SubscriptionPlanModel::create($attributes) : $plan->update($attributes);

            $plan->features()->whereNotIn('feature_key', $command->featureKeys)->delete();
            foreach ($command->featureKeys as $key) {
                $plan->features()->firstOrCreate(['feature_key' => $key]);
            }

            return $plan->load(['currency', 'features']);
        });
    }
}
