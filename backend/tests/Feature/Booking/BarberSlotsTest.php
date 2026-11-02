<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    $this->barber = BarberModel::factory()->freelancer()->create();
    $this->service = OfferedServiceModel::factory()->create(['duration_minutes' => 30]);
    $this->slotsUrl = fn (Carbon $date): string => '/api/v1/barbers/'.$this->barber->id.'/slots?'.http_build_query([
        'date' => $date->format('Y-m-d'),
        'service_ids' => [$this->service->id],
    ]);
});

it('returns bookable UTC slots for a barber', function (): void {
    $slots = $this->getJson(($this->slotsUrl)(Carbon::tomorrow()))->assertOk()->json('data');

    expect($slots)->not->toBeEmpty();

    foreach ($slots as $slot) {
        expect($slot['starts_at'])->toEndWith('Z');
        expect($slot['ends_at'])->toEndWith('Z');
    }
});

it('excludes slots overlapping a pending booking on the barber', function (): void {
    $date = Carbon::tomorrow();
    $startsAt = $date->copy()->setTime(10, 0);

    BookingModel::factory()->atHome()->create([
        'barber_id' => $this->barber->id,
        'starts_at' => $startsAt,
        'ends_at' => $startsAt->copy()->addMinutes(30),
        'booking_status' => BookingStatus::Pending,
    ]);

    $starts = collect(
        $this->getJson(($this->slotsUrl)($date))->assertOk()->json('data'),
    )->pluck('starts_at');

    expect($starts)->not->toContain($startsAt->toIso8601ZuluString());
    expect($starts)->toContain($startsAt->copy()->addMinutes(30)->toIso8601ZuluString());
});

it('returns no slots outside the barber active schedule', function (): void {
    $date = Carbon::tomorrow();
    BarberScheduleModel::factory()->create([
        'barber_id' => $this->barber->id,
        'day_of_week' => $date->dayOfWeek,
        'start_time' => '09:00',
        'end_time' => '11:00',
        'is_active' => true,
    ]);

    $slots = $this->getJson(($this->slotsUrl)($date))->assertOk()->json('data');

    expect($slots)->not->toBeEmpty();

    foreach ($slots as $slot) {
        expect(substr($slot['starts_at'], 11, 5))->toBeGreaterThanOrEqual('09:00');
        expect(substr($slot['ends_at'], 11, 5))->toBeLessThanOrEqual('11:00');
    }
});

it('rejects a missing service list with 422', function (): void {
    $this->getJson('/api/v1/barbers/'.$this->barber->id.'/slots?'.http_build_query([
        'date' => Carbon::tomorrow()->format('Y-m-d'),
    ]))->assertUnprocessable();
});

it('returns 404 for an unknown barber', function (): void {
    $this->getJson('/api/v1/barbers/00000000-0000-0000-0000-000000000000/slots?'.http_build_query([
        'date' => Carbon::tomorrow()->format('Y-m-d'),
        'service_ids' => [$this->service->id],
    ]))->assertNotFound();
});
