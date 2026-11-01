<?php

declare(strict_types=1);

namespace Modules\Barber\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Core\Constants\WeekdayConstants;

#[UseModel(BarberScheduleModel::class)]
class BarberScheduleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'barber_id' => null,
            'day_of_week' => fake()->numberBetween(WeekdayConstants::WEEKDAY_MIN, WeekdayConstants::WEEKDAY_MAX),
            'start_time' => '09:00',
            'end_time' => '17:00',
            'is_active' => true,
        ];
    }
}
