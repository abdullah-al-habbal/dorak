<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function () {
    $this->client = ClientModel::factory()->create();
    $this->branch = BranchModel::factory()->create();
    $this->service = OfferedServiceModel::factory()->create(['duration' => 30, 'serviceable_type' => 'brand', 'serviceable_id' => $this->branch->brand_id]);
    $this->actingAs($this->client, 'client');
});

it('rejects second booking when same chair+slot already confirmed', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ]);

    $response->assertStatus(409);
    expect(BookingModel::where('chair_id', $chair->id)
        ->whereNotIn('status', ['canceled'])
        ->count()
    )->toBe(1);
});

it('allows bookings on different chairs for same time_slot', function () {
    $chairA = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $chairB = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chairA->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chairB->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    expect(BookingModel::where('time_slot', Carbon::parse($timeSlot)->toDateTimeString())->count())->toBe(2);
});

it('handles race condition: direct DB insert then API attempt', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    BookingModel::create([
        'client_id' => $this->client->id,
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'ends_at' => Carbon::parse($timeSlot)->addMinutes(30),
        'status' => 'confirmed',
    ]);

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ]);

    $response->assertStatus(409);
});

it('allows re-booking after cancellation on same chair+slot', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    $booking = BookingModel::first();
    $booking->update(['status' => 'canceled']);

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    expect(BookingModel::where('chair_id', $chair->id)
        ->where('time_slot', Carbon::parse($timeSlot)->toDateTimeString())
        ->count()
    )->toBe(2);
});
