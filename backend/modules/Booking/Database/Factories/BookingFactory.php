<?php

declare(strict_types=1);

namespace Modules\Booking\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingPaymentMethod;
use Modules\Booking\Enums\BookingPaymentStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;

#[UseModel(BookingModel::class)]
class BookingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id' => ClientModel::factory(),
            'chair_id' => ChairModel::factory(),
            'branch_id' => fn (array $attrs) => ChairModel::query()->whereKey($attrs['chair_id'])->value('branch_id'),
            'barber_id' => BarberModel::factory(),
            'starts_at' => $startsAt = fake()->dateTimeBetween('+1 day', '+1 week'),
            'ends_at' => (clone $startsAt)->modify('+30 minutes'),
            'booking_status' => BookingStatus::Confirmed->value,
            'payment_method' => BookingPaymentMethod::PayAtSalon->value,
            'payment_status' => BookingPaymentStatus::UnpaidInPerson->value,
            'at_home_location' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attrs) => [
            'booking_status' => BookingStatus::Completed->value,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attrs) => [
            'booking_status' => BookingStatus::Cancelled->value,
        ]);
    }

    public function atHome(): static
    {
        return $this->state(fn (array $attrs) => [
            'at_home_location' => [
                'latitude' => fake()->latitude(),
                'longitude' => fake()->longitude(),
                'street' => fake()->streetName(),
                'building' => (string) fake()->buildingNumber(),
                'unit' => (string) fake()->numberBetween(1, 100),
            ],
            'chair_id' => null,
        ]);
    }
}
