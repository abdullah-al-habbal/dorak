<?php

declare(strict_types=1);

namespace Modules\ProductCatalog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Branch\Models\BranchModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\ProductCatalog\Models\BranchProductModel;
use Modules\ProductCatalog\Models\ProductModel;

#[UseModel(BranchProductModel::class)]
class BranchProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => ProductModel::factory(),
            'branch_id' => BranchModel::factory(),
            'price_amount_minor' => fake()->numberBetween(1000, 50000),
            'currency_code' => fn () => CurrencyModel::factory()->create()->code,
            'is_published' => false,
            'stock_quantity' => null,
            'stock_confirmed_at' => null,
        ];
    }

    /** A listing at the given branch of a product owned by that branch's own brand. */
    public function forBranch(BranchModel $branch): static
    {
        return $this->state([
            'branch_id' => $branch->getKey(),
            'product_id' => ProductModel::factory()->state(['brand_id' => $branch->brand_id]),
        ]);
    }

    public function published(): static
    {
        return $this->state(['is_published' => true]);
    }

    public function withStock(int $quantity): static
    {
        return $this->state(['stock_quantity' => $quantity, 'stock_confirmed_at' => now()]);
    }
}
