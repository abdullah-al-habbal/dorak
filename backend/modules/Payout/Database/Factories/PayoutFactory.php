<?php

declare(strict_types=1);

namespace Modules\Payout\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Brand\Models\BrandModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\Payout\Enums\PayoutDirection;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Payout\Models\PayoutModel;

#[UseModel(PayoutModel::class)]
class PayoutFactory extends Factory
{
    public function definition(): array
    {
        return [
            'brand_id' => BrandModel::factory(),
            'currency_id' => CurrencyModel::factory(),
            'direction' => PayoutDirection::BrandToPlatform,
            'status' => PayoutStatus::Draft,
            'total_minor' => 1000,
            'period_start' => now()->subMonth(),
            'period_end' => now(),
        ];
    }
}
