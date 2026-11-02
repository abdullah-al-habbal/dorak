<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Booking\Models\BookingModel;

describe('Dashboard Overview API', function (): void {
    it('returns dashboard summary metrics for a platform admin', function (): void {
        BookingModel::factory()->create(['starts_at' => now(), 'ends_at' => now()->addMinutes(30)]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonStructure(['data' => ['today_bookings_count', 'active_chairs_count', 'revenue']]);
    });
});
