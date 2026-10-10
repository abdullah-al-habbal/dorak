<?php

declare(strict_types=1);

namespace Modules\Client\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Client\Models\ClientModel;
use Modules\Client\Models\SocialAccountModel;

#[UseModel(SocialAccountModel::class)]
class SocialAccountFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id' => ClientModel::factory(),
            'provider' => 'google',
            'provider_id' => $this->faker->uuid(),
        ];
    }
}
