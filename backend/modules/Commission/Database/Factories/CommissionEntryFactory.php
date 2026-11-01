<?php

declare(strict_types=1);

namespace Modules\Commission\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Booking\Models\BookingModel;
use Modules\Brand\Models\BrandModel;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Currency\Models\CurrencyModel;

#[UseModel(CommissionEntryModel::class)]
class CommissionEntryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'booking_id' => BookingModel::factory(),
            'brand_id' => BrandModel::factory(),
            'rule_snapshot' => ['scope' => 'global', 'type' => 'percent', 'value_bps' => 1000],
            'base_amount_minor' => 10000,
            'commission_amount_minor' => 1000,
            'currency_code' => fn () => CurrencyModel::factory()->create()->code,
        ];
    }
}
