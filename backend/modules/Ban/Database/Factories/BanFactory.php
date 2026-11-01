<?php

// modules/Ban/Database/Factories/BanFactory.php
declare(strict_types=1);

namespace Modules\Ban\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Ban\Enums\BannableTypeEnum;
use Modules\Ban\Models\BanModel;
use Modules\Client\Models\ClientModel;

#[UseModel(BanModel::class)]
class BanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'bannable_id' => ClientModel::factory(),
            'bannable_type' => BannableTypeEnum::Client,
            'reason' => fake()->sentence(),
            'banned_from' => now()->subDay(),
        ];
    }

    public function permanent(): static
    {
        return $this->state(fn (array $attrs) => ['banned_until' => null]);
    }

    public function temporary(): static
    {
        return $this->state(fn (array $attrs) => [
            'banned_until' => now()->addDays(7),
        ]);
    }
}
