<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

#[UseModel(ServiceCatalogCategoryModel::class)]
class ServiceCatalogCategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => [
                'en' => $name,
                'ar' => fake('ar_SA')->word(),
            ],
            'slug' => Str::slug($name),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attrs) => [
            'is_active' => false,
        ]);
    }
}
