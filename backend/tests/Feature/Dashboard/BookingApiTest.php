<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\OfferedService\Models\OfferedServiceModel;

describe('Dashboard Booking API', function (): void {
    it('scopes and filters a branch manager booking list', function (): void {
        $branch = BranchModel::factory()->create();
        $otherBranch = BranchModel::factory()->create();
        $ownChair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $otherChair = ChairModel::factory()->create(['branch_id' => $otherBranch->id]);
        BookingModel::factory()->create(['chair_id' => $ownChair->id, 'status' => BookingStatus::Pending->value]);
        BookingModel::factory()->create(['chair_id' => $ownChair->id, 'status' => BookingStatus::Confirmed->value]);
        BookingModel::factory()->create(['chair_id' => $otherChair->id, 'status' => BookingStatus::Pending->value]);
        $this->authenticateDashboardActor($branch);

        $this->getJson('/api/v1/dashboard/bookings?status=pending&chair_id='.$ownChair->id)
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('allows a manager to cancel only a booking in its branch', function (): void {
        $branch = BranchModel::factory()->create();
        $otherBranch = BranchModel::factory()->create();
        $own = BookingModel::factory()->create(['chair_id' => ChairModel::factory()->create(['branch_id' => $branch->id])->id, 'status' => BookingStatus::Pending->value]);
        $other = BookingModel::factory()->create(['chair_id' => ChairModel::factory()->create(['branch_id' => $otherBranch->id])->id, 'status' => BookingStatus::Pending->value]);
        $this->authenticateDashboardActor($branch);

        $this->patchJson("/api/v1/dashboard/bookings/{$own->id}/cancel")->assertOk()->assertJsonPath('data.status', BookingStatus::Canceled->value);
        $this->getJson("/api/v1/dashboard/bookings/{$other->id}")->assertNotFound();
    });

    it('reschedules a booking and rejects a conflicting active slot', function (): void {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'time_slot' => now()->addDay(), 'ends_at' => now()->addDay()->addMinutes(30)]);
        BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Confirmed->value, 'time_slot' => now()->addDays(2), 'ends_at' => now()->addDays(2)->addMinutes(30)]);
        $this->authenticateDashboardActor($branch);

        $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}/reschedule", ['time_slot' => now()->addDays(3)->toIso8601String(), 'ends_at' => now()->addDays(3)->addMinutes(30)->toIso8601String()])->assertOk();
        $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}/reschedule", ['time_slot' => now()->addDays(2)->toIso8601String(), 'ends_at' => now()->addDays(2)->addMinutes(30)->toIso8601String()])->assertConflict()->assertJsonPath('code', 'BOOKING_SLOT_CONFLICT');
    });

    it('rejects rescheduling completed and canceled bookings', function (): void {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $completed = BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Completed]);
        $canceled = BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Canceled]);
        $this->authenticateDashboardActor($branch);

        foreach ([$completed, $canceled] as $booking) {
            $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}/reschedule", [
                'time_slot' => now()->addDays(3)->toIso8601String(),
                'ends_at' => now()->addDays(3)->addMinutes(30)->toIso8601String(),
            ])->assertUnprocessable();
        }
    });

    it('rejects a reschedule outside the barber schedule', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);
        $booking = BookingModel::factory()->create([
            'chair_id' => $chair->id,
            'barber_id' => $barber->id,
            'time_slot' => now()->addDay(),
            'ends_at' => now()->addDay()->addMinutes(30),
        ]);
        $target = now()->addDays(3)->startOfDay()->addHours(18);
        BarberScheduleModel::factory()->create([
            'barber_id' => $barber->id,
            'day_of_week' => $target->dayOfWeek,
            'start_time' => '09:00',
            'end_time' => '17:00',
            'is_active' => true,
        ]);
        $this->authenticateDashboardActor($branch);

        $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}/reschedule", [
            'time_slot' => $target->toIso8601String(),
            'ends_at' => $target->copy()->addMinutes(30)->toIso8601String(),
        ])->assertUnprocessable()->assertJsonPath('code', 'booking_outside_schedule');
    });

    it('rejects a walk-in booking outside the barber schedule', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create(['managed_by_branch_id' => $branch->id]);
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);
        $service = OfferedServiceModel::factory()->create(['serviceable_id' => $branch->brand_id, 'duration_minutes' => 30]);
        $target = now()->addDays(3)->startOfDay()->addHours(18);
        BarberScheduleModel::factory()->create([
            'barber_id' => $barber->id,
            'day_of_week' => $target->dayOfWeek,
            'start_time' => '09:00',
            'end_time' => '17:00',
            'is_active' => true,
        ]);
        $this->authenticateDashboardActor($branch);

        $this->postJson('/api/v1/dashboard/bookings/walk-in', [
            'branch_id' => $branch->id,
            'chair_id' => $chair->id,
            'barber_id' => $barber->id,
            'customer_name' => 'Walk In',
            'customer_email' => 'walk-in-schedule@example.test',
            'service_ids' => [$service->id],
            'time_slot' => $target->toIso8601String(),
        ])->assertUnprocessable()->assertJsonPath('code', 'booking_outside_schedule');

        $this->assertDatabaseCount('bookings', 0);
    });
});
