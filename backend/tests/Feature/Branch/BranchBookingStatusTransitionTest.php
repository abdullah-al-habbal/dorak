<?php

declare(strict_types=1);

use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;

beforeEach(function (): void {
    $this->branch = BranchModel::factory()->create(['password' => bcrypt('password123')]);
    $this->actingAs($this->branch, 'branch_api');
});

it('confirms a pending booking in the branch', function (): void {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'booking_status' => BookingStatus::Pending]);

    $this->patchJson("/api/v1/branch/bookings/{$booking->id}/status", ['booking_status' => BookingStatus::Confirmed])
        ->assertOk()->assertJsonPath('data.booking_status', BookingStatus::Confirmed->value);
});

it('rejects transitions from terminal bookings without changing their status', function (): void {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'booking_status' => BookingStatus::Completed]);

    $this->patchJson("/api/v1/branch/bookings/{$booking->id}/status", ['booking_status' => BookingStatus::InProgress])->assertUnprocessable();
    expect($booking->fresh()->booking_status)->toBe(BookingStatus::Completed);
});

it('hides bookings outside the branch scope', function (): void {
    $chair = ChairModel::factory()->create();
    $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'booking_status' => BookingStatus::Pending]);

    $this->patchJson("/api/v1/branch/bookings/{$booking->id}/status", ['booking_status' => BookingStatus::Confirmed])->assertNotFound();
});

it('allows a confirmed booking to become a no-show', function (): void {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'booking_status' => BookingStatus::Confirmed]);

    $this->patchJson("/api/v1/branch/bookings/{$booking->id}/status", ['booking_status' => BookingStatus::NoShow])
        ->assertOk()->assertJsonPath('data.booking_status', BookingStatus::NoShow->value);
});
