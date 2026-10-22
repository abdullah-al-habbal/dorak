<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Queue;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Jobs\SendBookingStatusNotificationJob;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;

function maintenanceChairWithBooking(BranchModel $branch, BookingStatus $status = BookingStatus::Confirmed): array
{
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'status' => ChairStatus::Available]);
    $booking = BookingModel::factory()->create([
        'chair_id' => $chair->id,
        'status' => $status->value,
        'time_slot' => now()->addDay(),
        'ends_at' => now()->addDay()->addMinutes(30),
    ]);

    return [$chair, $booking];
}

describe('branch toggle', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        $this->actingAs($this->branch, 'branch_api');
    });

    it('rejects maintenance with 409 while a future booking exists', function (): void {
        Queue::fake();
        [$chair, $booking] = maintenanceChairWithBooking($this->branch);

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => 'maintenance'])
            ->assertConflict()
            ->assertJsonPath('code', 'CHAIR_HAS_ACTIVE_BOOKINGS')
            ->assertJsonPath('errors.booking_ids', [$booking->id]);

        expect($chair->fresh()->status)->toBe(ChairStatus::Available);
        expect($booking->fresh()->status)->toBe(BookingStatus::Confirmed);
        Queue::assertNotPushed(SendBookingStatusNotificationJob::class);
    });

    it('cancels and notifies every affected booking with force', function (): void {
        Queue::fake();
        [$chair, $first] = maintenanceChairWithBooking($this->branch);
        $second = BookingModel::factory()->create([
            'chair_id' => $chair->id,
            'status' => BookingStatus::Pending->value,
            'time_slot' => now()->addDays(2),
            'ends_at' => now()->addDays(2)->addMinutes(30),
        ]);
        $past = BookingModel::factory()->completed()->create(['chair_id' => $chair->id]);

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => 'maintenance', 'force' => true])
            ->assertOk()
            ->assertJsonPath('data.status', 'maintenance')
            ->assertJsonCount(2, 'meta.canceled_booking_ids');

        expect($chair->fresh()->status)->toBe(ChairStatus::Maintenance);
        foreach ([$first, $second] as $booking) {
            $fresh = $booking->fresh();
            expect($fresh->status)->toBe(BookingStatus::Canceled);
            expect($fresh->cancellation_reason)->toBe('chair_maintenance');
        }
        expect($past->fresh()->status)->toBe(BookingStatus::Completed);
        Queue::assertPushed(SendBookingStatusNotificationJob::class, 2);
    });

    it('allows maintenance on a chair with no future bookings and ignores force', function (): void {
        Queue::fake();
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => 'maintenance'])
            ->assertOk()
            ->assertJsonPath('data.status', 'maintenance');
        Queue::assertNotPushed(SendBookingStatusNotificationJob::class);
    });

    it('does not block marking a chair occupied while a booking exists', function (): void {
        [$chair] = maintenanceChairWithBooking($this->branch, BookingStatus::InProgress);

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => 'occupied'])->assertOk();
    });

    it('rejects a non-boolean force flag', function (): void {
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => 'maintenance', 'force' => 'maybe'])
            ->assertUnprocessable();
    });
});

describe('shared chair update', function (): void {
    it('applies the same rules on PATCH /chairs/{chair}', function (): void {
        Queue::fake();
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api');
        [$chair, $booking] = maintenanceChairWithBooking($branch);

        $this->patchJson("/api/v1/chairs/{$chair->id}", ['status' => 'maintenance'])
            ->assertConflict()
            ->assertJsonPath('code', 'CHAIR_HAS_ACTIVE_BOOKINGS');
        expect($chair->fresh()->status)->toBe(ChairStatus::Available);

        $this->patchJson("/api/v1/chairs/{$chair->id}", ['status' => 'maintenance', 'force' => true])
            ->assertOk()
            ->assertJsonPath('meta.canceled_booking_ids', [$booking->id]);
        expect($booking->fresh()->status)->toBe(BookingStatus::Canceled);
        Queue::assertPushed(SendBookingStatusNotificationJob::class, 1);
    });
});
