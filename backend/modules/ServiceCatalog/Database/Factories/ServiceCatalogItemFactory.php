<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

#[UseModel(ServiceCatalogItemModel::class)]
class ServiceCatalogItemFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'category_id' => ServiceCatalogCategoryModel::factory(),
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
