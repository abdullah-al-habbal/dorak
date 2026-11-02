<?php

declare(strict_types=1);

namespace Modules\Activation\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Activation\Models\ActivationLogModel;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;

#[UseModel(ActivationLogModel::class)]
class ActivationLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'activable_id' => BarberModel::factory(),
            'activable_type' => ActivableTypeEnum::Barber,
            'status' => ActivationStatusEnum::Pending->value,
            'activated_by_id' => AdminModel::factory(),
            'activated_at' => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attrs) => ['status' => ActivationStatusEnum::Pending->value]);
    }

    public function enabled(): static
    {
        return $this->state(fn (array $attrs) => ['status' => ActivationStatusEnum::Enabled->value]);
    }

    public function disabled(): static
    {
        return $this->state(fn (array $attrs) => ['status' => ActivationStatusEnum::Disabled->value]);
    }
}
