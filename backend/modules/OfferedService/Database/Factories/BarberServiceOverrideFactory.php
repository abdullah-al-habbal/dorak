<?php

// modules/OfferedService/Database/Factories/BarberServiceOverrideFactory.php
declare(strict_types=1);

namespace Modules\OfferedService\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Brand\Models\BrandModel;
use Modules\OfferedService\Models\BarberServiceOverrideModel;
use Modules\OfferedService\Models\OfferedServiceModel;

#[UseModel(BarberServiceOverrideModel::class)]
class BarberServiceOverrideFactory extends Factory
{
    public function definition(): array
    {
        return [
            'offered_service_id' => OfferedServiceModel::factory(),
            'brand_id' => BrandModel::factory(),
            'price_amount_minor' => fake()->numberBetween(1000, 50000),
            'duration_minutes' => fake()->randomElement([15, 30, 45, 60]),
        ];
    }
}
