<?php

declare(strict_types=1);

namespace Modules\ProductCatalog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Branch\Models\BranchModel;
use Modules\ProductCatalog\Models\BranchCatalogSettingModel;

#[UseModel(BranchCatalogSettingModel::class)]
class BranchCatalogSettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'branch_id' => BranchModel::factory(),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
