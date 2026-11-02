<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

function bookingScheduleFor(BarberModel $barber, int $dayOfWeek, string $start, string $end, bool $active = true): BarberScheduleModel
{
    return BarberScheduleModel::factory()->create([
        'barber_id' => $barber->id,
        'day_of_week' => $dayOfWeek,
        'start_time' => $start,
        'end_time' => $end,
        'is_active' => $active,
    ]);
}

beforeEach(function (): void {
    $this->client = ClientModel::factory()->create();
    $this->branch = BranchModel::factory()->create();
    $this->barber = BarberModel::factory()->create();
    $this->chair = ChairModel::factory()->create([
        'branch_id' => $this->branch->id,
        'barber_id' => $this->barber->id,
    ]);
    $this->service = OfferedServiceModel::factory()->create(['duration_minutes' => 30, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
    $this->actingAs($this->client, 'client');
    $this->bookAt = fn (Carbon $startsAt) => $this->postJson('/api/v1/bookings', [
        'chair_id' => $this->chair->id,
        'barber_id' => $this->barber->id,
        'starts_at' => $startsAt->toIso8601String(),
        'service_ids' => [$this->service->id],
    ]);
});

it('accepts a booking fully inside an active barber schedule', function (): void {
    $slot = Carbon::tomorrow()->startOfDay()->addHours(10);
    bookingScheduleFor($this->barber, $slot->dayOfWeek, '09:00', '17:00');

    ($this->bookAt)($slot)->assertCreated();

    $this->assertDatabaseCount('bookings', 1);
});

it('rejects a client booking outside the active barber schedule with 422', function (): void {
    $slot = Carbon::tomorrow()->startOfDay()->addHours(18);
    bookingScheduleFor($this->barber, $slot->dayOfWeek, '09:00', '17:00');

    ($this->bookAt)($slot)
        ->assertUnprocessable()
        ->assertJsonPath('code', 'booking_outside_schedule');

    $this->assertDatabaseCount('bookings', 0);
});

it('rejects a client booking when the only schedule row is inactive', function (): void {
    $slot = Carbon::tomorrow()->startOfDay()->addHours(10);
    bookingScheduleFor($this->barber, $slot->dayOfWeek, '09:00', '17:00', active: false);

    ($this->bookAt)($slot)
        ->assertUnprocessable()
        ->assertJsonPath('code', 'booking_outside_schedule');

    $this->assertDatabaseCount('bookings', 0);
});

it('keeps a barber with no schedule rows bookable for backward compatibility', function (): void {
    $slot = Carbon::tomorrow()->startOfDay()->addHours(3);

    ($this->bookAt)($slot)->assertCreated();

    $this->assertDatabaseCount('bookings', 1);
});
