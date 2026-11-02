<?php

declare(strict_types=1);

use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Models\ClientModel;

beforeEach(function () {
    $this->client = ClientModel::factory()->create();
    $this->actingAs($this->client, 'client');
});

it('lists user bookings', function () {
    BookingModel::factory()->count(3)->create([
        'client_id' => $this->client->id,
    ]);

    $response = $this->getJson('/api/v1/bookings?per_page=10');

    $response->assertOk();
    $response->assertJsonStructure([
        'success',
        'data' => ['*' => ['id', 'starts_at', 'booking_status']],
        'meta' => ['pagination'],
    ]);
    expect($response->json('data'))->toHaveCount(3);
});

it('does not list other users bookings', function () {
    BookingModel::factory()->create();
    BookingModel::factory()->count(2)->create([
        'client_id' => $this->client->id,
    ]);

    $response = $this->getJson('/api/v1/bookings?per_page=10');

    expect($response->json('data'))->toHaveCount(2);
});

it('filters upcoming bookings', function () {
    BookingModel::factory()->create([
        'client_id' => $this->client->id,
        'booking_status' => BookingStatus::Confirmed,
        'starts_at' => now()->addWeek(),
        'ends_at' => now()->addWeek()->addMinutes(30),
    ]);
    BookingModel::factory()->completed()->create([
        'client_id' => $this->client->id,
        'starts_at' => now()->subWeek(),
    ]);

    $response = $this->getJson('/api/v1/bookings?status=upcoming&per_page=10');

    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.booking_status'))->toBe(BookingStatus::Confirmed->value);
});

it('filters past bookings', function () {
    BookingModel::factory()->completed()->create([
        'client_id' => $this->client->id,
        'starts_at' => now()->subWeek(),
    ]);
    BookingModel::factory()->create([
        'client_id' => $this->client->id,
        'booking_status' => BookingStatus::Confirmed,
        'starts_at' => now()->addWeek(),
        'ends_at' => now()->addWeek()->addMinutes(30),
    ]);

    $response = $this->getJson('/api/v1/bookings?status=past&per_page=10');

    expect($response->json('data'))->toHaveCount(1);
});
