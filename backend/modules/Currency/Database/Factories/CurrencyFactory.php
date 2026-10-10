<?php

// modules/Currency/Database/Factories/CurrencyFactory.php
declare(strict_types=1);

namespace Modules\Currency\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Currency\Models\CurrencyModel;

#[UseModel(CurrencyModel::class)]
class CurrencyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->currencyCode(),
            'name' => [
                'en' => fake()->word(),
                'ar' => fake('ar_SA')->word(),
            ],
            'symbol' => fake()->randomElement(['$', '£', '€']),
            'is_default' => false,
        ];
    }
}
