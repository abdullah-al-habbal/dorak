<?php

// modules/Currency/Database/Factories/ExchangeRateFactory.php
declare(strict_types=1);

namespace Modules\Currency\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Currency\Models\CurrencyModel;
use Modules\Currency\Models\ExchangeRateModel;

#[UseModel(ExchangeRateModel::class)]
class ExchangeRateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'from_currency_code' => fn () => CurrencyModel::factory()->create()->code,
            'to_currency_code' => fn () => CurrencyModel::factory()->create()->code,
            'rate_ratio' => fake()->randomFloat(6, 0.5, 100),
            'effective_at' => now(),
        ];
    }
}
