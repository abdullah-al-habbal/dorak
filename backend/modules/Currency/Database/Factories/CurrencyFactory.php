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
            'code' => fn (): string => $this->unusedCode(),
            'name' => [
                'en' => fake()->word(),
                'ar' => fake('ar_SA')->word(),
            ],
            'symbol' => fake()->randomElement(['$', '£', '€']),
            'is_default' => false,
        ];
    }

    /**
     * Faker's unique() only remembers codes it generated in this process, not rows already stored
     * (CurrencySeeder's SYP and USD), so skip stored codes to keep `currencies_code_unique` intact.
     */
    private function unusedCode(): string
    {
        do {
            $code = fake()->unique()->currencyCode();
        } while (CurrencyModel::query()->where('code', $code)->exists());

        return $code;
    }
}
