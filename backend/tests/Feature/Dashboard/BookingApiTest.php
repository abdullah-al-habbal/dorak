<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Models\OfferedServiceModel;

describe('Dashboard Booking API', function (): void {
    it('scopes and filters a branch manager booking list', function (): void {
        $branch = BranchModel::factory()->create();
        $otherBranch = BranchModel::factory()->create();
        $ownChair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $otherChair = ChairModel::factory()->create(['branch_id' => $otherBranch->id]);
        BookingModel::factory()->create(['chair_id' => $ownChair->id, 'booking_status' => BookingStatus::Pending->value]);
        BookingModel::factory()->create(['chair_id' => $ownChair->id, 'booking_status' => BookingStatus::Confirmed->value]);
        BookingModel::factory()->create(['chair_id' => $otherChair->id, 'booking_status' => BookingStatus::Pending->value]);
        $this->authenticateDashboardActor($branch);

        $this->getJson('/api/v1/dashboard/bookings?booking_status=pending&chair_id='.$ownChair->id)
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('hides cancelled bookings when asked', function (): void {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        BookingModel::factory()->create(['chair_id' => $chair->id, 'booking_status' => BookingStatus::Confirmed->value]);
        BookingModel::factory()->create(['chair_id' => $chair->id, 'booking_status' => BookingStatus::Cancelled->value]);
        $this->authenticateDashboardActor($branch);

        $this->getJson('/api/v1/dashboard/bookings')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/dashboard/bookings?hide_cancelled=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.booking_status', BookingStatus::Confirmed->value);
    });

    it('searches bookings by client name with partial and empty matches', function (): void {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $otherChair = ChairModel::factory()->create(['branch_id' => BranchModel::factory()->create()->id]);
        $sara = ClientModel::factory()->create(['name' => ['en' => 'Sara Ahmed', 'ar' => 'سارة أحمد']]);
        $omar = ClientModel::factory()->create(['name' => ['en' => 'Omar Khaled', 'ar' => 'عمر خالد']]);
        $outsider = ClientModel::factory()->create(['name' => ['en' => 'Sara Outside', 'ar' => 'سارة']]);
        BookingModel::factory()->create(['chair_id' => $chair->id, 'client_id' => $sara->id]);
        BookingModel::factory()->create(['chair_id' => $chair->id, 'client_id' => $omar->id]);
        BookingModel::factory()->create(['chair_id' => $otherChair->id, 'client_id' => $outsider->id]);
        $this->authenticateDashboardActor($branch);

        $this->getJson('/api/v1/dashboard/bookings?search=Sara Ahmed')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/dashboard/bookings?search=sar')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/dashboard/bookings?search='.rawurlencode('عمر'))->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/dashboard/bookings?search=nobody')->assertOk()->assertJsonCount(0, 'data');
    });

    it('allows a manager to cancel only a booking in its branch', function (): void {
        $branch = BranchModel::factory()->create();
        $otherBranch = BranchModel::factory()->create();
        $own = BookingModel::factory()->create(['chair_id' => ChairModel::factory()->create(['branch_id' => $branch->id])->id, 'booking_status' => BookingStatus::Pending->value]);
        $other = BookingModel::factory()->create(['chair_id' => ChairModel::factory()->create(['branch_id' => $otherBranch->id])->id, 'booking_status' => BookingStatus::Pending->value]);
        $this->authenticateDashboardActor($branch);

        $this->patchJson("/api/v1/dashboard/bookings/{$own->id}/cancel")->assertOk()->assertJsonPath('data.booking_status', BookingStatus::Cancelled->value);
        $this->getJson("/api/v1/dashboard/bookings/{$other->id}")->assertNotFound();
    });

    it('reschedules a booking and rejects a conflicting active slot', function (): void {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'starts_at' => now()->addDay(), 'ends_at' => now()->addDay()->addMinutes(30)]);
        BookingModel::factory()->create(['chair_id' => $chair->id, 'booking_status' => BookingStatus::Confirmed->value, 'starts_at' => now()->addDays(2), 'ends_at' => now()->addDays(2)->addMinutes(30)]);
        $this->authenticateDashboardActor($branch);

        $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}/reschedule", ['starts_at' => now()->addDays(3)->toIso8601String(), 'ends_at' => now()->addDays(3)->addMinutes(30)->toIso8601String()])->assertOk();
        $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}/reschedule", ['starts_at' => now()->addDays(2)->toIso8601String(), 'ends_at' => now()->addDays(2)->addMinutes(30)->toIso8601String()])->assertConflict()->assertJsonPath('code', 'BOOKING_SLOT_CONFLICT');
    });

    it('rejects rescheduling completed and cancelled bookings', function (): void {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $completed = BookingModel::factory()->create(['chair_id' => $chair->id, 'booking_status' => BookingStatus::Completed]);
        $cancelled = BookingModel::factory()->create(['chair_id' => $chair->id, 'booking_status' => BookingStatus::Cancelled]);
        $this->authenticateDashboardActor($branch);

        foreach ([$completed, $cancelled] as $booking) {
            $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}/reschedule", [
                'starts_at' => now()->addDays(3)->toIso8601String(),
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
            'starts_at' => now()->addDay(),
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
            'starts_at' => $target->toIso8601String(),
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
            'starts_at' => $target->toIso8601String(),
        ])->assertUnprocessable()->assertJsonPath('code', 'booking_outside_schedule');

        $this->assertDatabaseCount('bookings', 0);
    });
});
