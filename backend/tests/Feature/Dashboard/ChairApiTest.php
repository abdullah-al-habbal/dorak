<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;

describe('Dashboard Chair API', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        $this->otherBranch = BranchModel::factory()->create();
    });

    it('limits a branch manager to chairs in its branch', function (): void {
        $own = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        $other = ChairModel::factory()->create(['branch_id' => $this->otherBranch->id]);
        $this->actingAs($this->branch, 'branch_api');

        $this->getJson("/api/v1/dashboard/chairs/{$own->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/chairs/{$other->id}")->assertNotFound();
        $this->getJson('/api/v1/dashboard/chairs')->assertOk()->assertJsonCount(1, 'data');
    });

    it('lets an admin update and delete an unbooked chair', function (): void {
        $this->actingAs(AdminModel::factory()->create(), 'admin_api');
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", chairPayload($chair, ['label' => 'A-02']))
            ->assertOk()
            ->assertJsonPath('data.label', 'A-02');
        $this->deleteJson("/api/v1/dashboard/chairs/{$chair->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/chairs/{$chair->id}")->assertNotFound();
    });

    it('does not let a branch manager assign a barber already owned by another branch', function (): void {
        $barber = BarberModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $this->otherBranch->id, 'barber_id' => $barber->id]);
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        $this->actingAs($this->branch, 'branch_api');

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", chairPayload($chair, ['barber_id' => $barber->id]))
            ->assertForbidden();
    });

    it('returns conflict when a future booking protects a chair from deactivation', function (): void {
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        BookingModel::factory()->create([
            'chair_id' => $chair->id,
            'status' => BookingStatus::Pending->value,
            'ends_at' => now()->addHour(),
        ]);
        $this->actingAs($this->branch, 'branch_api');

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", chairPayload($chair, [
            'status' => ChairStatus::Maintenance->value,
        ]))->assertConflict()->assertJsonPath('code', 'CHAIR_HAS_ACTIVE_BOOKINGS');
    });

    it('returns conflict when a future booking protects a chair from deletion', function (): void {
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        BookingModel::factory()->create([
            'chair_id' => $chair->id,
            'status' => BookingStatus::Confirmed->value,
            'ends_at' => now()->addHour(),
        ]);
        $this->actingAs($this->branch, 'branch_api');

        $this->deleteJson("/api/v1/dashboard/chairs/{$chair->id}")
            ->assertConflict()
            ->assertJsonPath('code', 'CHAIR_HAS_ACTIVE_BOOKINGS');
    });
});

function chairPayload(ChairModel $chair, array $overrides = []): array
{
    return array_replace([
        'branch_id' => $chair->branch_id,
        'barber_id' => $chair->barber_id,
        'label' => $chair->label,
        'floor_zone' => $chair->floor_zone?->value ?? 'shared',
        'status' => $chair->status->value,
        'ui_metadata' => [
            'position_x' => 10,
            'position_y' => 10,
            'width' => 60,
            'height' => 60,
        ],
    ], $overrides);
}
