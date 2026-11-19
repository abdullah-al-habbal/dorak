<?php

declare(strict_types=1);

namespace Modules\ProductCatalog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\ProductCatalog\Models\BranchProductModel;
use Modules\ProductCatalog\Models\StockAdjustmentModel;

#[UseModel(StockAdjustmentModel::class)]
class StockAdjustmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'branch_product_id' => BranchProductModel::factory(),
            'actor_type' => StatusChangeActorTypeEnum::System,
            'actor_id' => null,
            'quantity_before' => null,
            'quantity_after' => 0,
            'version_after' => 2,
            'reason' => null,
        ];
    }
}
