<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;

function scheduleBooking(BarberModel $barber, string $startsAt, BookingStatus $status = BookingStatus::Confirmed): BookingModel
{
    $chair = ChairModel::factory()->create(['barber_id' => $barber->id]);

    return BookingModel::factory()->create([
        'chair_id' => $chair->id,
        'barber_id' => $barber->id,
        'starts_at' => $startsAt,
        'ends_at' => date('Y-m-d H:i:s', strtotime($startsAt) + 1800),
        'booking_status' => $status->value,
    ]);
}

describe('Dashboard barber schedule API', function (): void {
    it('lists only the signed-in barber appointments, earliest first', function (): void {
        $barber = BarberModel::factory()->create();
        $other = BarberModel::factory()->create();
        $late = scheduleBooking($barber, '2026-11-09 15:00:00');
        $early = scheduleBooking($barber, '2026-11-09 09:00:00');
        scheduleBooking($other, '2026-11-09 11:00:00');
        $this->authenticateDashboardActor($barber);

        $this->getJson('/api/v1/dashboard/schedule/appointments')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $early->id)
            ->assertJsonPath('data.1.id', $late->id)
            ->assertJsonPath('meta.pagination.total', 2);
    });

    it('filters by status and an inclusive date range', function (): void {
        $barber = BarberModel::factory()->create();
        scheduleBooking($barber, '2026-11-06 23:30:00');
        scheduleBooking($barber, '2026-11-07 00:00:00');
        scheduleBooking($barber, '2026-11-07 23:59:00', BookingStatus::Pending);
        scheduleBooking($barber, '2026-11-08 00:00:00');
        $this->authenticateDashboardActor($barber);

        $this->getJson('/api/v1/dashboard/schedule/appointments?date_from=2026-11-07&date_to=2026-11-07')
            ->assertOk()
            ->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/dashboard/schedule/appointments?date_from=2026-11-07&date_to=2026-11-07&booking_status=pending')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.booking_status', BookingStatus::Pending->value);
    });

    it('paginates and rejects invalid filters', function (): void {
        $barber = BarberModel::factory()->create();
        foreach (['09', '10', '11'] as $hour) {
            scheduleBooking($barber, "2026-11-09 {$hour}:00:00");
        }
        $this->authenticateDashboardActor($barber);

        $this->getJson('/api/v1/dashboard/schedule/appointments?per_page=2&page=2')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.pagination.total_pages', 2);
        $this->getJson('/api/v1/dashboard/schedule/appointments?per_page=500')->assertUnprocessable();
        $this->getJson('/api/v1/dashboard/schedule/appointments?booking_status=nope')->assertUnprocessable();
        $this->getJson('/api/v1/dashboard/schedule/appointments?date_from=2026-11-09&date_to=2026-11-01')->assertUnprocessable();
    });

    it('ignores a barber id supplied by the client', function (): void {
        $barber = BarberModel::factory()->create();
        $other = BarberModel::factory()->create();
        scheduleBooking($other, '2026-11-09 11:00:00');
        $this->authenticateDashboardActor($barber);

        $this->getJson('/api/v1/dashboard/schedule/appointments?barber_id='.$other->id.'&stylist_id='.$other->id)
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('returns the weekly hours of the signed-in barber ordered by weekday', function (): void {
        $barber = BarberModel::factory()->create();
        $other = BarberModel::factory()->create();
        BarberScheduleModel::factory()->create(['barber_id' => $barber->id, 'day_of_week' => 3, 'start_time' => '10:00', 'end_time' => '18:00']);
        BarberScheduleModel::factory()->create(['barber_id' => $barber->id, 'day_of_week' => 1, 'start_time' => '09:00', 'end_time' => '13:00', 'is_active' => false]);
        BarberScheduleModel::factory()->create(['barber_id' => $other->id, 'day_of_week' => 2]);
        $this->authenticateDashboardActor($barber);

        $this->getJson('/api/v1/dashboard/schedule/hours')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.day_of_week', 1)
            ->assertJsonPath('data.0.start_time', '09:00')
            ->assertJsonPath('data.0.is_active', false)
            ->assertJsonPath('data.1.day_of_week', 3)
            ->assertJsonPath('data.1.end_time', '18:00');
    });

    it('returns an empty list for a barber without hours or appointments', function (): void {
        $this->authenticateDashboardActor(BarberModel::factory()->create());

        $this->getJson('/api/v1/dashboard/schedule/hours')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/dashboard/schedule/appointments')->assertOk()->assertJsonCount(0, 'data');
    });

    it('rejects managers and platform admins with 403', function (): void {
        $this->authenticateDashboardActor(BranchModel::factory()->create());
        $this->getJson('/api/v1/dashboard/schedule/appointments')->assertForbidden();
        $this->getJson('/api/v1/dashboard/schedule/hours')->assertForbidden();

        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->getJson('/api/v1/dashboard/schedule/appointments')->assertForbidden();
        $this->getJson('/api/v1/dashboard/schedule/hours')->assertForbidden();
    });

    it('requires a dashboard session', function (): void {
        $this->getJson('/api/v1/dashboard/schedule/appointments')->assertUnauthorized();
        $this->getJson('/api/v1/dashboard/schedule/hours')->assertUnauthorized();
    });

    it('keeps the Operations routes closed to barbers', function (): void {
        $this->authenticateDashboardActor(BarberModel::factory()->create());

        $this->getJson('/api/v1/dashboard/bookings')->assertForbidden();
    });
});
