<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    $this->client = ClientModel::factory()->create();
    $this->branch = BranchModel::factory()->create();
    $this->chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $this->service = OfferedServiceModel::factory()->create(['duration' => 30, 'serviceable_type' => 'brand', 'serviceable_id' => $this->branch->brand_id]);
    $this->actingAs($this->client, 'client');
    $this->slotsUrl = fn (Carbon $date, array $overrides = []): string => '/api/v1/branches/'.$this->branch->id.'/slots?'.http_build_query(array_merge([
        'date' => $date->format('Y-m-d'),
        'service_ids' => [$this->service->id],
        'chair_id' => $this->chair->id,
    ], $overrides));
});

it('returns bookable UTC slots for a chair', function (): void {
    $slots = $this->getJson(($this->slotsUrl)(Carbon::tomorrow()))->assertOk()->json('data');

    expect($slots)->not->toBeEmpty();

    foreach ($slots as $slot) {
        expect($slot['starts_at'])->toEndWith('Z');
        expect($slot['ends_at'])->toEndWith('Z');
    }
});

it('books a returned slot with the same chair and services', function (): void {
    $slots = $this->getJson(($this->slotsUrl)(Carbon::tomorrow()))->assertOk()->json('data');

    expect($slots)->not->toBeEmpty();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $this->chair->id,
        'time_slot' => $slots[0]['starts_at'],
        'service_ids' => [$this->service->id],
    ])->assertCreated();
});

it('excludes slots overlapping a pending booking on the requested chair', function (): void {
    $date = Carbon::tomorrow();
    $startsAt = $date->copy()->setTime(10, 0);

    BookingModel::factory()->create([
        'chair_id' => $this->chair->id,
        'barber_id' => null,
        'time_slot' => $startsAt,
        'ends_at' => $startsAt->copy()->addMinutes(30),
        'status' => BookingStatus::Pending,
    ]);

    $starts = collect(
        $this->getJson(($this->slotsUrl)($date))->assertOk()->json('data'),
    )->pluck('starts_at');

    expect($starts)->not->toContain($startsAt->toIso8601ZuluString());
    expect($starts)->not->toContain($startsAt->copy()->addMinutes(15)->toIso8601ZuluString());
    expect($starts)->toContain($startsAt->copy()->addMinutes(30)->toIso8601ZuluString());
});

it('drops a slot once it has been booked', function (): void {
    $date = Carbon::tomorrow();

    $slots = $this->getJson(($this->slotsUrl)($date))->assertOk()->json('data');
    $start = $slots[0]['starts_at'];

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $this->chair->id,
        'time_slot' => $start,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    $starts = collect(
        $this->getJson(($this->slotsUrl)($date))->assertOk()->json('data'),
    )->pluck('starts_at');

    expect($starts)->not->toContain($start);
});

it('returns no slots outside the assigned barber active schedule', function (): void {
    $barber = BarberModel::factory()->create();
    $chair = ChairModel::factory()->create([
        'branch_id' => $this->branch->id,
        'barber_id' => $barber->id,
    ]);
    $date = Carbon::tomorrow();
    BarberScheduleModel::factory()->create([
        'barber_id' => $barber->id,
        'day_of_week' => $date->dayOfWeek,
        'start_time' => '09:00',
        'end_time' => '11:00',
        'is_active' => true,
    ]);

    $slots = $this->getJson(($this->slotsUrl)($date, ['chair_id' => $chair->id]))->assertOk()->json('data');

    expect($slots)->not->toBeEmpty();

    foreach ($slots as $slot) {
        expect(substr($slot['starts_at'], 11, 5))->toBeGreaterThanOrEqual('09:00');
        expect(substr($slot['ends_at'], 11, 5))->toBeLessThanOrEqual('11:00');
    }
});

it('rejects a missing service list with 422', function (): void {
    $this->getJson('/api/v1/branches/'.$this->branch->id.'/slots?'.http_build_query([
        'date' => Carbon::tomorrow()->format('Y-m-d'),
        'chair_id' => $this->chair->id,
    ]))->assertUnprocessable();
});

it('returns 404 for an unknown branch', function (): void {
    $this->getJson('/api/v1/branches/00000000-0000-0000-0000-000000000000/slots?'.http_build_query([
        'date' => Carbon::tomorrow()->format('Y-m-d'),
        'service_ids' => [$this->service->id],
        'chair_id' => $this->chair->id,
    ]))->assertNotFound();
});
