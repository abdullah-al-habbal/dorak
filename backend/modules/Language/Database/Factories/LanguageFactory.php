<?php

// modules/Language/Database/Factories/LanguageFactory.php
declare(strict_types=1);

namespace Modules\Language\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Language\Enums\TextDirectionEnum;
use Modules\Language\Models\LanguageModel;

#[UseModel(LanguageModel::class)]
class LanguageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->randomElement(['en', 'ar']),
            'name' => [
                'en' => fake()->word(),
                'ar' => fake('ar_SA')->word(),
            ],
            'direction' => TextDirectionEnum::Ltr,
            'is_default' => false,
        ];
    }
}
