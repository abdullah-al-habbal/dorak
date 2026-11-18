<?php

declare(strict_types=1);

namespace Modules\Marketing\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Marketing\Models\MarketingPageModel;

#[UseModel(MarketingPageModel::class)]
final class MarketingPageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'slug' => $this->faker->unique()->slug(2),
            'title' => [
                'en' => $this->faker->sentence(3),
                'ar' => 'عنوان الصفحة',
            ],
            'meta_description' => [
                'en' => $this->faker->sentence(6),
                'ar' => 'وصف الصفحة',
            ],
            'published_at' => now(),
        ];
    }

    public function draft(): self
    {
        return $this->state(['published_at' => null]);
    }
}
