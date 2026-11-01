<?php

declare(strict_types=1);

namespace Modules\Commission\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Commission\Enums\CommissionScope;
use Modules\Commission\Enums\CommissionType;
use Modules\Commission\Models\CommissionRuleModel;

#[UseModel(CommissionRuleModel::class)]
class CommissionRuleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'scope' => CommissionScope::Global,
            'scope_id' => null,
            'type' => CommissionType::Percent,
            'value_bps' => 1000,
            'value_amount_minor' => null,
            'currency_code' => null,
            'is_active' => true,
        ];
    }
}
