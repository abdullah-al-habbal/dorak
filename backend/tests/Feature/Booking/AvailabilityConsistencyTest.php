<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    $this->client = ClientModel::factory()->create();
    $this->branch = BranchModel::factory()->create();
    $this->service = OfferedServiceModel::factory()->create(['duration' => 30, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
    $this->chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $this->actingAs($this->client, 'client');
});

it('reports free exactly when a booking can be created for the interval', function (): void {
    $startsAt = Carbon::now()->addDay()->startOfMinute();
    $floorPlanUrl = fn () => '/api/v1/branches/'.$this->branch->id.'/floor-plan?'.http_build_query([
        'starts_at' => $startsAt->toIso8601ZuluString(),
        'duration' => 30,
    ]);

    $this->getJson($floorPlanUrl())->assertOk()->assertJsonPath('data.chairs.0.availability', 'available');

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $this->chair->id,
        'time_slot' => $startsAt->toIso8601ZuluString(),
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    $this->getJson($floorPlanUrl())->assertOk()->assertJsonPath('data.chairs.0.availability', 'occupied');
    $this->postJson('/api/v1/bookings', [
        'chair_id' => $this->chair->id,
        'time_slot' => $startsAt->toIso8601ZuluString(),
        'service_ids' => [$this->service->id],
    ])->assertStatus(409);
});

it('counts pending bookings as unavailable in floor plans and chair listings', function (): void {
    $startsAt = Carbon::now()->addDay()->startOfMinute();
    BookingModel::factory()->create([
        'chair_id' => $this->chair->id,
        'time_slot' => $startsAt,
        'ends_at' => $startsAt->copy()->addMinutes(30),
        'status' => BookingStatus::Pending,
    ]);

    $this->getJson('/api/v1/branches/'.$this->branch->id.'/floor-plan?'.http_build_query([
        'starts_at' => $startsAt->toIso8601ZuluString(),
        'duration' => 30,
    ]))->assertOk()->assertJsonPath('data.chairs.0.availability', 'occupied');

    $this->travelTo($startsAt);
    $this->getJson('/api/v1/chairs?branch_id='.$this->branch->id)
        ->assertOk()->assertJsonPath('data.0.availability', 'occupied');
    $this->travelBack();
});

it('uses active interval overlap for explore available_now barbers', function (): void {
    $now = Carbon::now()->startOfMinute();
    Carbon::setTestNow($now);
    $busy = BarberModel::factory()->freelancer()->create([
        'latitude' => 33.5,
        'longitude' => 36.3,
    ]);
    $free = BarberModel::factory()->freelancer()->create([
        'latitude' => 33.5,
        'longitude' => 36.3,
    ]);

    BookingModel::factory()->create([
        'barber_id' => $busy->id,
        'time_slot' => $now->copy()->subMinutes(10),
        'ends_at' => $now->copy()->addMinutes(20),
        'status' => BookingStatus::InProgress,
    ]);
    BookingModel::factory()->create([
        'barber_id' => $free->id,
        'time_slot' => $now->copy()->subMinutes(40),
        'ends_at' => $now->copy()->subMinutes(10),
        'status' => BookingStatus::Confirmed,
    ]);

    $this->getJson('/api/v1/explore/barbers?latitude=33.5&longitude=36.3&radius=1000&available_now=1')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $free->id);

    Carbon::setTestNow();
});
