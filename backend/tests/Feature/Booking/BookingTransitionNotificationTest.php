<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Events\BookingCancelledEvent;
use Modules\Booking\Events\BookingRescheduledEvent;
use Modules\Booking\Events\BookingStatusUpdatedEvent;
use Modules\Booking\Jobs\SendBookingStatusNotificationJob;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;

beforeEach(function (): void {
    Queue::fake();
    Event::fake([BookingStatusUpdatedEvent::class, BookingCancelledEvent::class, BookingRescheduledEvent::class]);
});

function assertNotifiedOnce(string $event): void
{
    Queue::assertPushed(SendBookingStatusNotificationJob::class, 1);
    Event::assertDispatchedTimes($event, 1);
}

it('notifies once when a client cancels', function (): void {
    $client = ClientModel::factory()->create();
    $this->actingAs($client, 'client');
    $booking = BookingModel::factory()->create(['client_id' => $client->id, 'status' => BookingStatus::Confirmed, 'time_slot' => now()->addHours(5)]);

    $this->postJson("/api/v1/client/bookings/{$booking->id}/cancel")->assertOk();

    assertNotifiedOnce(BookingCancelledEvent::class);
});

it('notifies once when a barber cancels', function (): void {
    $barber = BarberModel::factory()->create();
    $this->actingAs($barber, 'barber');
    $booking = BookingModel::factory()->create(['barber_id' => $barber->id, 'status' => BookingStatus::Confirmed, 'time_slot' => now()->addHours(5)]);

    $this->postJson("/api/v1/barber/bookings/{$booking->id}/cancel", ['cancellation_reason' => 'sick'])->assertOk();

    assertNotifiedOnce(BookingCancelledEvent::class);
});

it('notifies once for each barber lifecycle action', function (string $path, BookingStatus $from): void {
    $barber = BarberModel::factory()->create();
    $this->actingAs($barber, 'barber');
    $booking = BookingModel::factory()->create(['barber_id' => $barber->id, 'status' => $from]);

    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/{$path}")->assertOk();

    assertNotifiedOnce(BookingStatusUpdatedEvent::class);
})->with([
    'accept' => ['accept', BookingStatus::Pending],
    'start' => ['start', BookingStatus::Confirmed],
    'complete' => ['complete', BookingStatus::InProgress],
    'no-show' => ['no-show', BookingStatus::InProgress],
]);

it('notifies once on dashboard status update, cancel and reschedule', function (): void {
    $branch = BranchModel::factory()->create();
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
    $this->authenticateDashboardActor($branch);

    $update = BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Pending]);
    $this->patchJson("/api/v1/dashboard/bookings/{$update->id}", ['status' => 'confirmed'])->assertOk();
    assertNotifiedOnce(BookingStatusUpdatedEvent::class);

    Queue::fake();
    $cancel = BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Pending]);
    $this->patchJson("/api/v1/dashboard/bookings/{$cancel->id}/cancel")->assertOk();
    assertNotifiedOnce(BookingCancelledEvent::class);

    Queue::fake();
    $move = BookingModel::factory()->create(['chair_id' => $chair->id, 'time_slot' => now()->addDay(), 'ends_at' => now()->addDay()->addMinutes(30)]);
    $this->patchJson("/api/v1/dashboard/bookings/{$move->id}/reschedule", [
        'time_slot' => now()->addDays(3)->toIso8601String(),
        'ends_at' => now()->addDays(3)->addMinutes(30)->toIso8601String(),
    ])->assertOk();
    assertNotifiedOnce(BookingRescheduledEvent::class);
});

it('notifies once on branch status update', function (): void {
    $branch = BranchModel::factory()->create();
    $this->actingAs($branch, 'branch_api');
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
    $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Pending]);

    $this->patchJson("/api/v1/branch/bookings/{$booking->id}/status", ['status' => 'confirmed'])->assertOk();

    assertNotifiedOnce(BookingStatusUpdatedEvent::class);
});

it('dispatches nothing when a transition is rejected', function (): void {
    $branch = BranchModel::factory()->create();
    $this->actingAs($branch, 'branch_api');
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
    $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Completed]);

    $this->patchJson("/api/v1/branch/bookings/{$booking->id}/status", ['status' => 'in_progress'])->assertUnprocessable();

    Queue::assertNotPushed(SendBookingStatusNotificationJob::class);
    Event::assertNotDispatched(BookingStatusUpdatedEvent::class);
    Event::assertNotDispatched(BookingCancelledEvent::class);
});

it('never dispatches the notification job from an http action', function (): void {
    $hits = [];
    foreach (glob(base_path('modules/*/Http/Actions'), GLOB_ONLYDIR) ?: [] as $dir) {
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
        foreach ($files as $file) {
            if ($file->isFile() && str_contains((string) file_get_contents($file->getPathname()), 'SendBookingStatusNotificationJob')) {
                $hits[] = $file->getPathname();
            }
        }
    }

    expect($hits)->toBe([]);
});
