<?php

// modules/Brand/Database/Factories/BrandFactory.php
declare(strict_types=1);

namespace Modules\Brand\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;

#[UseModel(BrandModel::class)]
class BrandFactory extends Factory
{
    public function pending(): static
    {
        return $this->state(['status' => BrandStatusEnum::Pending]);
    }

    public function definition(): array
    {
        return [
            'owner_id' => ClientModel::factory(),
            'name' => [
                'en' => fake()->company(),
                'ar' => fake('ar_SA')->company(),
            ],
            'description' => [
                'en' => fake()->sentence(),
                'ar' => fake('ar_SA')->sentence(),
            ],
            'logo_url' => null,
            'status' => BrandStatusEnum::Active,
            'base_currency_code' => fn () => CurrencyModel::factory()->create()->code,
        ];
    }
}
