<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

#[UseModel(ServiceCatalogItemTagModel::class)]
class ServiceCatalogItemTagFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => [
                'en' => $name,
                'ar' => fake('ar_SA')->word(),
            ],
            'slug' => \Str::slug($name),
            'is_active' => true,
        ];
    }
}
