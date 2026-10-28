<?php

declare(strict_types=1);

namespace Modules\Subscription\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Brand\Models\BrandModel;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;

#[UseModel(BrandSubscriptionModel::class)]
class BrandSubscriptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'brand_id' => BrandModel::factory(),
            'plan_id' => SubscriptionPlanModel::factory(),
            'status' => SubscriptionStatus::Active,
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ];
    }
}
