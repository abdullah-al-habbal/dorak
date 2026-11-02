<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingPaymentMethod;
use Modules\Booking\Enums\BookingPaymentStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function () {
    $this->client = ClientModel::factory()->create();
    $this->branch = BranchModel::factory()->create();
    $this->service = OfferedServiceModel::factory()->create(['duration' => 30, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
    $this->actingAs($this->client, 'client');
});

it('creates a booking with chair_id', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ]);

    $response->assertCreated();
    $response->assertJsonStructure([
        'success',
        'data' => ['id', 'time_slot', 'status', 'payment_method', 'payment_status', 'chair'],
    ]);
    expect($response->json('data.status'))->toBe(BookingStatus::Pending->value);
    expect($response->json('data.payment_method'))->toBe(BookingPaymentMethod::PayAtSalon->value);
    expect($response->json('data.payment_status'))->toBe(BookingPaymentStatus::UnpaidInPerson->value);
});

it('rejects payment gateway payloads for in-person bookings', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => Carbon::now()->addDay()->toIso8601ZuluString(),
        'service_ids' => [$this->service->id],
        'payment_intent' => 'pi_not_supported',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['payment_intent']);
});

it('rejects double booking on same chair and time_slot', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ]);

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ]);

    $response->assertStatus(409);
});

it('rejects booking on unavailable chair', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $chair->update(['status' => ChairStatus::Maintenance]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ]);

    $response->assertStatus(409);
});

it('rejects booking with past time_slot', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->subDay()->toIso8601ZuluString();

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ]);

    $response->assertStatus(422);
});

it('creates at-home booking without chair_id', function () {
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();
    $barber = BarberModel::factory()->create(['latitude' => 33.5, 'longitude' => 36.3, 'travel_radius_km' => 10]);
    $service = OfferedServiceModel::factory()->atHome()->create(['duration' => 30, 'serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => $barber->id]);

    $response = $this->postJson('/api/v1/bookings', [
        'at_home_location' => [
            'latitude' => 33.5,
            'longitude' => 36.3,
            'street' => 'Al Hamra Street',
            'building' => '12',
            'unit' => '4B',
        ],
        'time_slot' => $timeSlot,
        'barber_id' => $barber->id,
        'service_ids' => [$service->id],
    ]);

    $response->assertCreated();
    expect($response->json('data.status'))->toBe(BookingStatus::Pending->value);
});

it('rejects booking with both chair_id and at_home_location', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'at_home_location' => [
            'latitude' => 33.5,
            'longitude' => 36.3,
            'street' => 'Al Hamra Street',
            'building' => '12',
            'unit' => '4B',
        ],
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ]);

    $response->assertStatus(422);
});

it('ensures only one booking per chair+slot in database after conflict', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ])->assertStatus(409);

    expect(BookingModel::where('chair_id', $chair->id)
        ->whereNotIn('status', ['canceled'])
        ->count()
    )->toBe(1);
});

it('allows booking after a cancelled booking on same chair+slot', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    // Cancel the booking
    $booking = BookingModel::first();
    $booking->update(['status' => BookingStatus::Canceled]);

    // Now booking the same slot should succeed
    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ])->assertCreated();
});

it('allows different chairs for same time_slot', function () {
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

it('prevents race condition: concurrent booking for same chair+slot', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $timeSlot = Carbon::now()->addDay()->toIso8601ZuluString();

    // Simulate concurrent request: insert a booking directly (bypassing check)
    // then verify API rejects a second one
    BookingModel::create([
        'client_id' => $this->client->id,
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'ends_at' => Carbon::parse($timeSlot)->addMinutes(30),
        'status' => BookingStatus::Confirmed,
    ]);

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot,
        'service_ids' => [$this->service->id],
    ])->assertStatus(409);
});

it('requires authentication', function () {
    $this->app->get('auth')->forgetGuards();

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => 'some-id',
        'time_slot' => Carbon::now()->addDay()->toIso8601ZuluString(),
        'service_ids' => [$this->service->id],
    ]);

    $response->assertUnauthorized();
});

it('derives the booking end time from the selected service durations', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $service = OfferedServiceModel::factory()->create(['duration' => 45, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
    $timeSlot = Carbon::tomorrow()->setTime(10, 0);

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot->toIso8601ZuluString(),
        'service_ids' => [$service->id],
    ]);

    $response->assertCreated();
    expect($response->json('data.ends_at'))->toBe($timeSlot->copy()->addMinutes(45)->toIso8601String());
});

it('rejects an overlapping booking for the same chair', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $service = OfferedServiceModel::factory()->create(['duration' => 60, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
    $timeSlot = Carbon::tomorrow()->setTime(10, 0);

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot->toIso8601ZuluString(),
        'service_ids' => [$service->id],
    ])->assertCreated();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => $timeSlot->copy()->addMinutes(30)->toIso8601ZuluString(),
        'service_ids' => [$this->service->id],
    ])->assertStatus(409);
});

it('rejects an overlapping booking for the same barber on another chair', function () {
    $barber = BarberModel::factory()->create();
    $chairA = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $barber->id]);
    $chairB = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $barber->id]);
    $service = OfferedServiceModel::factory()->create(['duration' => 60, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
    $timeSlot = Carbon::tomorrow()->setTime(10, 0);

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chairA->id,
        'barber_id' => $barber->id,
        'time_slot' => $timeSlot->toIso8601ZuluString(),
        'service_ids' => [$service->id],
    ])->assertCreated();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chairB->id,
        'barber_id' => $barber->id,
        'time_slot' => $timeSlot->copy()->addMinutes(30)->toIso8601ZuluString(),
        'service_ids' => [$this->service->id],
    ])->assertStatus(409);
});

it('requires a full address for at-home bookings', function () {
    $response = $this->postJson('/api/v1/bookings', [
        'at_home_location' => [
            'latitude' => 33.5,
            'longitude' => 36.3,
            'street' => 'Al Hamra Street',
        ],
        'time_slot' => Carbon::tomorrow()->setTime(10, 0)->toIso8601ZuluString(),
        'service_ids' => [$this->service->id],
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors([
        'at_home_location.building',
        'at_home_location.unit',
    ]);
});
