<?php

declare(strict_types=1);

namespace Modules\ProductCatalog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\ProductCatalog\Models\ProductMediumModel;
use Modules\ProductCatalog\Models\ProductModel;

#[UseModel(ProductMediumModel::class)]
class ProductMediumFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => ProductModel::factory(),
            'image_path' => 'product-media/'.fake()->uuid().'.jpg',
            'alt_text' => null,
            'sort_order' => 0,
        ];
    }
}
