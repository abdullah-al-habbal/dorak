<?php

// modules/Preference/Database/Factories/PreferenceFactory.php
declare(strict_types=1);

namespace Modules\Preference\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Preference\Models\PreferenceModel;

#[UseModel(PreferenceModel::class)]
class PreferenceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'preferenceable_id' => null,
            'preferenceable_type' => null,
            'preferred_language' => 'ar',
            'notification_enabled' => true,
            'display_currency_id' => null,
            'theme' => 'light',
            'price_display_mode' => 'tax_inclusive',
        ];
    }
}
