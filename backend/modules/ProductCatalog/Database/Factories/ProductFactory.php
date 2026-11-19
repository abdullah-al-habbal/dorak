<?php

declare(strict_types=1);

namespace Modules\ProductCatalog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Brand\Models\BrandModel;
use Modules\ProductCatalog\Models\ProductModel;

#[UseModel(ProductModel::class)]
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'brand_id' => BrandModel::factory(),
            'name' => [
                'en' => fake()->words(2, true),
                'ar' => fake('ar_SA')->word(),
            ],
            'description' => [
                'en' => fake()->sentence(),
                'ar' => fake('ar_SA')->sentence(),
            ],
            'category' => fake()->randomElement(['shampoo', 'conditioner', 'styling', 'skincare']),
            'metadata' => ['size_ml' => fake()->randomElement([100, 250, 500])],
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
