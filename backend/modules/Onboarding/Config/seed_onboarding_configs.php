<?php

declare(strict_types=1);

use Modules\Onboarding\Enums\Season;

return [
    // English default
    [
        'locale' => 'en',
        'season' => null,
        'source_path' => database_path('seeders/assets/onboarding/hero_default_en.jpg'),
        'is_active' => true,
        'sort_order' => 0,
    ],
    // Arabic default
    [
        'locale' => 'ar',
        'season' => null,
        'source_path' => database_path('seeders/assets/onboarding/hero_default_ar.jpg'),
        'is_active' => true,
        'sort_order' => 0,
    ],
    // English seasonal
    [
        'locale' => 'en',
        'season' => Season::Spring->value,
        'source_path' => database_path('seeders/assets/onboarding/hero_spring_en.jpg'),
        'is_active' => true,
        'sort_order' => 1,
    ],
    [
        'locale' => 'en',
        'season' => Season::Summer->value,
        'source_path' => database_path('seeders/assets/onboarding/hero_summer_en.jpg'),
        'is_active' => true,
        'sort_order' => 1,
    ],
    [
        'locale' => 'en',
        'season' => Season::Autumn->value,
        'source_path' => database_path('seeders/assets/onboarding/hero_autumn_en.jpg'),
        'is_active' => true,
        'sort_order' => 1,
    ],
    [
        'locale' => 'en',
        'season' => Season::Winter->value,
        'source_path' => database_path('seeders/assets/onboarding/hero_winter_en.jpg'),
        'is_active' => true,
        'sort_order' => 1,
    ],
    // Arabic seasonal
    [
        'locale' => 'ar',
        'season' => Season::Spring->value,
        'source_path' => database_path('seeders/assets/onboarding/hero_spring_ar.jpg'),
        'is_active' => true,
        'sort_order' => 1,
    ],
    [
        'locale' => 'ar',
        'season' => Season::Summer->value,
        'source_path' => database_path('seeders/assets/onboarding/hero_summer_ar.jpg'),
        'is_active' => true,
        'sort_order' => 1,
    ],
    [
        'locale' => 'ar',
        'season' => Season::Autumn->value,
        'source_path' => database_path('seeders/assets/onboarding/hero_autumn_ar.jpg'),
        'is_active' => true,
        'sort_order' => 1,
    ],
    [
        'locale' => 'ar',
        'season' => Season::Winter->value,
        'source_path' => database_path('seeders/assets/onboarding/hero_winter_ar.jpg'),
        'is_active' => true,
        'sort_order' => 1,
    ],
];
