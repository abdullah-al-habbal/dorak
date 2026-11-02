<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Models\ChairModel;

beforeEach(function () {
    $this->barber = BarberModel::factory()->create();
    $this->actingAs($this->barber, 'barber');
});

it('moves an assigned booking through the barber lifecycle', function () {
    $booking = BookingModel::factory()->create([
        'barber_id' => $this->barber->id,
        'booking_status' => BookingStatus::Pending,
    ]);

    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/accept")->assertOk()->assertJsonPath('data.booking_status', BookingStatus::Confirmed->value);
    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/start")->assertOk()->assertJsonPath('data.booking_status', BookingStatus::InProgress->value);
    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/complete")->assertOk()->assertJsonPath('data.booking_status', BookingStatus::Completed->value);
});

it('rejects an invalid or terminal status jump', function () {
    $booking = BookingModel::factory()->create([
        'barber_id' => $this->barber->id,
        'booking_status' => BookingStatus::Confirmed,
    ]);

    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/complete")->assertUnprocessable();
    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/start")->assertOk();
    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/no-show")->assertOk()->assertJsonPath('data.booking_status', BookingStatus::NoShow->value);
    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/start")->assertUnprocessable();
});

it('does not allow a barber to update another barber booking', function () {
    $booking = BookingModel::factory()->create(['booking_status' => BookingStatus::Pending]);

    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/accept")->assertForbidden();
});

it('allows the barber assigned to the booking chair to accept it', function () {
    $chair = ChairModel::factory()->create(['barber_id' => $this->barber->id]);
    $booking = BookingModel::factory()->create([
        'chair_id' => $chair->id,
        'barber_id' => null,
        'booking_status' => BookingStatus::Pending,
    ]);

    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/accept")->assertOk();
});

it('rejects acceptance if another active booking overlaps the same chair', function () {
    $chair = ChairModel::factory()->create(['barber_id' => $this->barber->id]);
    $active = BookingModel::factory()->create([
        'chair_id' => $chair->id,
        'barber_id' => $this->barber->id,
        'booking_status' => BookingStatus::Confirmed,
    ]);
    $pending = BookingModel::factory()->create([
        'chair_id' => $chair->id,
        'barber_id' => $this->barber->id,
        'starts_at' => $active->starts_at->copy()->addMinutes(15),
        'ends_at' => $active->ends_at->copy()->addMinutes(15),
        'booking_status' => BookingStatus::Pending,
    ]);

    $this->patchJson("/api/v1/barber/bookings/{$pending->id}/accept")->assertConflict();
});
