<?php

declare(strict_types=1);

use Carbon\Carbon;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Models\BranchOpeningHourModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

// BG-55: opening hours and barber schedules are times in the branch's zone, Asia/Damascus by default
// (UTC+3). These tests state that behaviour and fail until branches have a time zone, so they are
// skipped. Run them with: REPRODUCE_BUGS=1 vendor/bin/pest tests/Feature/Booking/BranchTimeZoneTest.php
$skipBg55 = getenv('REPRODUCE_BUGS') !== '1';

beforeEach(function (): void {
    $this->travelTo(Carbon::parse('2026-12-01 00:00:00', 'UTC'));
    $this->day = Carbon::parse('2026-12-02', 'UTC');
    $this->branch = BranchModel::factory()->create();
    $this->barber = BarberModel::factory()->create();
    $this->chair = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $this->barber->id]);
    $this->service = OfferedServiceModel::factory()->create(['duration_minutes' => 30, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
    $this->actingAs(ClientModel::factory()->create(), 'client');

    $this->slotStarts = fn (): array => collect($this->getJson('/api/v1/branches/'.$this->branch->id.'/slots?'.http_build_query([
        'date' => $this->day->format('Y-m-d'),
        'service_ids' => [$this->service->id],
        'chair_id' => $this->chair->id,
    ]))->assertOk()->json('data'))->pluck('starts_at')->all();
});

it('reads branch opening hours in the branch time zone', function (): void {
    BranchOpeningHourModel::query()->create([
        'branch_id' => $this->branch->id,
        'day_of_week' => $this->day->dayOfWeek,
        'is_closed' => false,
        'opens_time' => '09:00',
        'closes_time' => '18:00',
    ]);

    $starts = ($this->slotStarts)();

    // 09:00 to 18:00 in Damascus is 06:00 to 15:00 UTC; the last 30-minute slot starts at 14:30.
    expect($starts)->not->toBeEmpty()
        ->and($starts[0])->toBe('2026-12-02T06:00:00Z')
        ->and($starts[array_key_last($starts)])->toBe('2026-12-02T14:30:00Z');
})->skip($skipBg55, 'BG-55: branches have no time zone yet.');

it('reads barber schedules in the branch time zone', function (): void {
    BarberScheduleModel::factory()->create([
        'barber_id' => $this->barber->id,
        'day_of_week' => $this->day->dayOfWeek,
        'start_time' => '09:00',
        'end_time' => '11:00',
        'is_active' => true,
    ]);

    $starts = ($this->slotStarts)();

    expect($starts)->not->toBeEmpty()
        ->and($starts[0])->toBe('2026-12-02T06:00:00Z')
        ->and($starts[array_key_last($starts)])->toBe('2026-12-02T07:30:00Z');
})->skip($skipBg55, 'BG-55: branches have no time zone yet.');

it('accepts a booking at opening time in the branch time zone', function (): void {
    BranchOpeningHourModel::query()->create([
        'branch_id' => $this->branch->id,
        'day_of_week' => $this->day->dayOfWeek,
        'is_closed' => false,
        'opens_time' => '09:00',
        'closes_time' => '18:00',
    ]);

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $this->chair->id,
        'starts_at' => '2026-12-02T06:00:00Z',
        'service_ids' => [$this->service->id],
    ], ['Idempotency-Key' => (string) Str::uuid()])->assertCreated();
})->skip($skipBg55, 'BG-55: branches have no time zone yet.');
