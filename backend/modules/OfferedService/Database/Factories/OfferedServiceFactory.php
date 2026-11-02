<?php

// modules/OfferedService/Database/Factories/OfferedServiceFactory.php
declare(strict_types=1);

namespace Modules\OfferedService\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Brand\Models\BrandModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

#[UseModel(OfferedServiceModel::class)]
class OfferedServiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'serviceable_id' => BrandModel::factory(),
            'serviceable_type' => ServiceableTypeEnum::Brand,
            'name' => [
                'en' => fake()->word(),
                'ar' => fake('ar_SA')->word(),
            ],
            'description' => [
                'en' => fake()->sentence(),
                'ar' => fake('ar_SA')->sentence(),
            ],
            'price_amount_minor' => fake()->numberBetween(1000, 50000),
            'currency_code' => fn () => CurrencyModel::factory()->create()->code,
            'duration_minutes' => fake()->randomElement([15, 30, 45, 60]),
            'is_at_home' => false,
            'is_active' => true,
        ];
    }

    public function atHome(): static
    {
        return $this->state(fn (array $attrs) => [
            'is_at_home' => true,
        ]);
    }
}
