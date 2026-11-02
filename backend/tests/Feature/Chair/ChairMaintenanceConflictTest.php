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
        'booking_status' => $status->value,
        'starts_at' => now()->addDay(),
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

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => ChairStatus::Maintenance])
            ->assertConflict()
            ->assertJsonPath('code', 'CHAIR_HAS_ACTIVE_BOOKINGS')
            ->assertJsonPath('errors.booking_ids', [$booking->id]);

        expect($chair->fresh()->status)->toBe(ChairStatus::Available);
        expect($booking->fresh()->booking_status)->toBe(BookingStatus::Confirmed);
        Queue::assertNotPushed(SendBookingStatusNotificationJob::class);
    });

    it('cancels and notifies every affected booking with force', function (): void {
        Queue::fake();
        [$chair, $first] = maintenanceChairWithBooking($this->branch);
        $second = BookingModel::factory()->create([
            'chair_id' => $chair->id,
            'booking_status' => BookingStatus::Pending->value,
            'starts_at' => now()->addDays(2),
            'ends_at' => now()->addDays(2)->addMinutes(30),
        ]);
        $past = BookingModel::factory()->completed()->create(['chair_id' => $chair->id]);

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => ChairStatus::Maintenance, 'force' => true])
            ->assertOk()
            ->assertJsonPath('data.status', ChairStatus::Maintenance->value)
            ->assertJsonCount(2, 'meta.cancelled_booking_ids');

        expect($chair->fresh()->status)->toBe(ChairStatus::Maintenance);
        foreach ([$first, $second] as $booking) {
            $fresh = $booking->fresh();
            expect($fresh->booking_status)->toBe(BookingStatus::Cancelled);
            expect($fresh->cancellation_reason)->toBe('chair_maintenance');
        }
        expect($past->fresh()->booking_status)->toBe(BookingStatus::Completed);
        Queue::assertPushed(SendBookingStatusNotificationJob::class, 2);
    });

    it('allows maintenance on a chair with no future bookings and ignores force', function (): void {
        Queue::fake();
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => ChairStatus::Maintenance])
            ->assertOk()
            ->assertJsonPath('data.status', ChairStatus::Maintenance->value);
        Queue::assertNotPushed(SendBookingStatusNotificationJob::class);
    });

    it('does not block marking a chair occupied while a booking exists', function (): void {
        [$chair] = maintenanceChairWithBooking($this->branch, BookingStatus::InProgress);

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => ChairStatus::Occupied])->assertOk();
    });

    it('rejects a non-boolean force flag', function (): void {
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => ChairStatus::Maintenance, 'force' => 'maybe'])
            ->assertUnprocessable();
    });
});

describe('shared chair update', function (): void {
    it('applies the same rules on PATCH /chairs/{chair}', function (): void {
        Queue::fake();
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api');
        [$chair, $booking] = maintenanceChairWithBooking($branch);

        $this->patchJson("/api/v1/chairs/{$chair->id}", ['status' => ChairStatus::Maintenance])
            ->assertConflict()
            ->assertJsonPath('code', 'CHAIR_HAS_ACTIVE_BOOKINGS');
        expect($chair->fresh()->status)->toBe(ChairStatus::Available);

        $this->patchJson("/api/v1/chairs/{$chair->id}", ['status' => ChairStatus::Maintenance, 'force' => true])
            ->assertOk()
            ->assertJsonPath('meta.cancelled_booking_ids', [$booking->id]);
        expect($booking->fresh()->booking_status)->toBe(BookingStatus::Cancelled);
        Queue::assertPushed(SendBookingStatusNotificationJob::class, 1);
    });
});
