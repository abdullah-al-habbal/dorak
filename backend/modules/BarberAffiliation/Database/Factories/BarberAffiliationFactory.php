<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;

#[UseModel(BarberAffiliationModel::class)]
class BarberAffiliationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'barber_id' => BarberModel::factory(),
            'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch,
            'initiated_by_id' => BranchModel::factory(),
            'affiliable_id' => BranchModel::factory(),
            'affiliable_type' => AffiliableType::Branch,
            'status' => AffiliationStatus::Active,
            'commission_rate' => null,
            'invited_at' => now()->subDays(7),
            'accepted_at' => now()->subDays(6),
            'terminated_at' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => AffiliationStatus::Pending->value,
            'accepted_at' => null,
        ]);
    }

    public function terminated(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => AffiliationStatus::Terminated->value,
            'terminated_at' => now(),
        ]);
    }
}
