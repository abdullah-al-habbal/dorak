<?php

declare(strict_types=1);

use Carbon\Carbon;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Branch\Models\BranchHoursOverrideModel;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Models\BranchOpeningHourModel;
use Modules\Branch\Services\BranchHours;
use Modules\Branch\Services\BranchTimeZones;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

// BG-55: opening hours, date exceptions and barber schedules are times in the branch's zone,
// Asia/Damascus (UTC+3) by default. Instants are stored and sent in UTC.
beforeEach(function (): void {
    $this->travelTo(Carbon::parse('2026-12-01 00:00:00', 'UTC'));
    $this->day = Carbon::parse('2026-12-02', 'UTC');
    $this->branch = BranchModel::factory()->create();
    $this->barber = BarberModel::factory()->create();
    $this->chair = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $this->barber->id]);
    $this->service = OfferedServiceModel::factory()->create(['duration_minutes' => 30, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
    $this->actingAs(ClientModel::factory()->create(), 'client');

    $this->openDay = fn () => BranchOpeningHourModel::query()->create([
        'branch_id' => $this->branch->id,
        'day_of_week' => $this->day->dayOfWeek,
        'is_closed' => false,
        'opens_time' => '09:00',
        'closes_time' => '18:00',
    ]);
    $this->bookAt = fn (string $startsAt) => $this->postJson('/api/v1/bookings', [
        'chair_id' => $this->chair->id,
        'starts_at' => $startsAt,
        'service_ids' => [$this->service->id],
    ], ['Idempotency-Key' => (string) Str::uuid()]);

    $this->slotsUrl = fn (): string => '/api/v1/branches/'.$this->branch->id.'/slots?'.http_build_query([
        'date' => $this->day->format('Y-m-d'),
        'service_ids' => [$this->service->id],
        'chair_id' => $this->chair->id,
    ]);
    $this->slotStarts = fn (): array => collect($this->getJson(($this->slotsUrl)())->assertOk()->json('data'))->pluck('starts_at')->all();
});

it('reads branch opening hours in the branch time zone', function (): void {
    ($this->openDay)();

    $starts = ($this->slotStarts)();

    // 09:00 to 18:00 in Damascus is 06:00 to 15:00 UTC; the last 30-minute slot starts at 14:30.
    expect($starts)->not->toBeEmpty()
        ->and($starts[0])->toBe('2026-12-02T06:00:00Z')
        ->and($starts[array_key_last($starts)])->toBe('2026-12-02T14:30:00Z');
});

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
});

it('accepts a booking at opening time in the branch time zone', function (): void {
    ($this->openDay)();

    ($this->bookAt)('2026-12-02T06:00:00Z')->assertCreated();
});

it('does not let a barber schedule cover a booking that runs past midnight', function (): void {
    BarberScheduleModel::factory()->create([
        'barber_id' => $this->barber->id,
        'day_of_week' => $this->day->dayOfWeek,
        'start_time' => '09:00',
        'end_time' => '11:00',
        'is_active' => true,
    ]);

    // 23:30 to 00:00 on the branch's clock.
    ($this->bookAt)('2026-12-02T20:30:00Z')->assertUnprocessable()->assertJsonPath('code', 'booking_outside_schedule');
});

it('reads the hours of a branch in its own zone', function (): void {
    app(BranchTimeZones::class)->set($this->branch->id, 'Asia/Kolkata');
    ($this->openDay)();

    $slots = $this->getJson(($this->slotsUrl)())->assertOk()->json('data');

    // 09:00 at UTC+05:30.
    expect($slots[0]['starts_at'])->toBe('2026-12-02T03:30:00Z')
        ->and($slots[0]['timezone'])->toBe('Asia/Kolkata')
        ->and($slots[0]['utc_offset_minutes'])->toBe(330);
});

it('keeps local opening time across a clock change', function (): void {
    app(BranchTimeZones::class)->set($this->branch->id, 'Europe/London');
    $this->travelTo(Carbon::parse('2027-03-27 00:00:00', 'UTC'));
    // The clocks go forward in London on 2027-03-28.
    $this->day = Carbon::parse('2027-03-28', 'UTC');
    ($this->openDay)();

    $slots = $this->getJson(($this->slotsUrl)())->assertOk()->json('data');

    expect($slots[0]['starts_at'])->toBe('2027-03-28T08:00:00Z')
        ->and($slots[0]['utc_offset_minutes'])->toBe(60);
});

it('applies a date exception to the branch calendar date', function (): void {
    ($this->openDay)();
    BranchHoursOverrideModel::query()->create(['branch_id' => $this->branch->id, 'override_date' => '2026-12-02', 'is_closed' => true]);

    expect(($this->slotStarts)())->toBe([]);
});

it('sends the zone and the offset with a booking and its branch', function (): void {
    ($this->bookAt)('2026-12-02T06:00:00Z')
        ->assertCreated()
        ->assertJsonPath('data.timezone', 'Asia/Damascus')
        ->assertJsonPath('data.utc_offset_minutes', 180);

    $this->getJson('/api/v1/explore/branches/'.$this->branch->id)
        ->assertOk()
        ->assertJsonPath('data.timezone', 'Asia/Damascus');
});

it('shows today\'s hours for today at the branch', function (): void {
    // 22:30 UTC on the 1st is already the 2nd in Damascus.
    $this->travelTo(Carbon::parse('2026-12-01 22:30:00', 'UTC'));
    ($this->openDay)();

    expect(app(BranchHours::class)->today($this->branch->id)['date'])->toBe('2026-12-02');
});
