<?php

declare(strict_types=1);

namespace Modules\Payment\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Payment\Enums\PaymentGatewayDriver;
use Modules\Payment\Models\PaymentGatewayModel;

#[UseModel(PaymentGatewayModel::class)]
class PaymentGatewayFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->slug(2),
            'name' => ['en' => fake()->word(), 'ar' => fake('ar_SA')->word()],
            'driver' => PaymentGatewayDriver::Offline,
            'is_active' => true,
            'is_default' => false,
            'config' => null,
            'sort_order' => 0,
        ];
    }
}
