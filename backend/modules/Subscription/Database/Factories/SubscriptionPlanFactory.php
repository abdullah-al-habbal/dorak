<?php

declare(strict_types=1);

namespace Modules\Subscription\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Currency\Models\CurrencyModel;
use Modules\Subscription\Enums\SubscriptionIntervalUnitEnum;
use Modules\Subscription\Models\SubscriptionPlanModel;

#[UseModel(SubscriptionPlanModel::class)]
class SubscriptionPlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => ['en' => fake()->unique()->word(), 'ar' => fake('ar_SA')->word()],
            'description' => ['en' => fake()->sentence(), 'ar' => fake('ar_SA')->sentence()],
            'price_minor' => 2500,
            'currency_id' => CurrencyModel::factory(),
            'interval_unit' => SubscriptionIntervalUnitEnum::Month,
            'interval_count' => 1,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
