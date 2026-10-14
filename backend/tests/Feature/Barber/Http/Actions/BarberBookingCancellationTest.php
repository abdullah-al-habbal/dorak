<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Event;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Events\BookingCancelledEvent;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Models\ChairModel;

beforeEach(function (): void {
    $this->barber = BarberModel::factory()->create();
    $this->actingAs($this->barber, 'barber');
});

function barberBookingForCancellation(BarberModel $barber, string $timeSlot): BookingModel
{
    $chair = ChairModel::factory()->create(['barber_id' => $barber->id]);

    return BookingModel::factory()->create([
        'barber_id' => $barber->id,
        'chair_id' => $chair->id,
        'status' => BookingStatus::Confirmed->value,
        'time_slot' => $timeSlot,
    ]);
}

it('requires a cancellation reason', function (): void {
    $booking = barberBookingForCancellation($this->barber, now()->addHours(3)->toDateTimeString());

    $this->postJson("/api/v1/barber/bookings/{$booking->id}/cancel")
        ->assertUnprocessable()
        ->assertJsonValidationErrors('cancellation_reason');
});

it('rejects cancellation two hours or less before the appointment', function (): void {
    $booking = barberBookingForCancellation($this->barber, now()->addHours(2)->toDateTimeString());

    $this->postJson("/api/v1/barber/bookings/{$booking->id}/cancel", [
        'cancellation_reason' => 'Unable to attend.',
    ])->assertUnprocessable();

    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'status' => BookingStatus::Confirmed->value,
    ]);
});

it('locks, cancels, persists the reason, and broadcasts the cancellation', function (): void {
    $booking = barberBookingForCancellation($this->barber, now()->addHours(3)->toDateTimeString());
    Event::fake([BookingCancelledEvent::class]);

    $this->postJson("/api/v1/barber/bookings/{$booking->id}/cancel", [
        'cancellation_reason' => 'Unable to attend.',
    ])->assertOk()
        ->assertJsonPath('data.id', $booking->id)
        ->assertJsonPath('data.status', BookingStatus::Canceled->value);

    expect(file_get_contents(base_path('modules/Booking/Eloquent/Resolvers/Shared/BookingLifecycleEloquentResolver.php')))->toContain('lockForUpdate()');
    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'status' => BookingStatus::Canceled->value,
        'cancellation_reason' => 'Unable to attend.',
    ]);
    Event::assertDispatched(BookingCancelledEvent::class, function (BookingCancelledEvent $event) use ($booking): bool {
        return $event->bookingId === $booking->id
            && $event->barberId === $this->barber->id
            && $event->branchId === $booking->chair->branch_id;
    });
});
