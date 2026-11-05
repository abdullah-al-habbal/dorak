<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Queue;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Database\Factories\BarberAffiliationFactory;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Jobs\SendBookingStatusNotificationJob;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
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
        $this->authenticateDashboardActor($this->branch);

        $this->getJson("/api/v1/dashboard/chairs/{$own->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/chairs/{$other->id}")->assertNotFound();
        $this->getJson('/api/v1/dashboard/chairs')->assertOk()->assertJsonCount(1, 'data');
    });

    it('lets an admin update and delete an unbooked chair', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", chairPayload($chair, ['label' => 'A-02']))
            ->assertOk()
            ->assertJsonPath('data.label', 'A-02');
        $this->deleteJson("/api/v1/dashboard/chairs/{$chair->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/chairs/{$chair->id}")->assertNotFound();
    });

    it('rejects a foreign barber with a field validation error', function (): void {
        $barber = BarberModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        $this->authenticateDashboardActor($this->branch);

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", chairPayload($chair, ['barber_id' => $barber->id]))
            ->assertUnprocessable()
            ->assertJsonStructure(['errors' => ['barber_id']]);
        expect($chair->fresh()->barber_id)->toBeNull();
    });

    it('rejects a foreign barber when creating a dashboard chair', function (): void {
        $barber = BarberModel::factory()->create();
        $chair = ChairModel::factory()->make(['branch_id' => $this->branch->id]);
        $this->authenticateDashboardActor($this->branch);

        $this->postJson('/api/v1/dashboard/chairs', chairPayload($chair, ['barber_id' => $barber->id]))
            ->assertUnprocessable()
            ->assertJsonStructure(['errors' => ['barber_id']]);
        expect(ChairModel::query()->where('branch_id', $this->branch->id)->exists())->toBeFalse();
    });

    it('allows a barber with an accepted brand affiliation', function (): void {
        $brand = BrandModel::factory()->create();
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => null]);
        $barber = BarberModel::factory()->create();
        BarberAffiliationFactory::new()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $brand->id,
            'affiliable_type' => AffiliableType::Brand,
            'status' => AffiliationStatus::Active->value,
        ]);
        $this->authenticateDashboardActor($branch);

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", chairPayload($chair, ['barber_id' => $barber->id]))->assertOk();
        expect($chair->fresh()->barber_id)->toBe($barber->id);
    });

    it('clears and preserves barber assignment according to barber_id presence', function (): void {
        $barber = BarberModel::factory()->create(['managed_by_branch_id' => $this->branch->id]);
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $barber->id]);
        $this->authenticateDashboardActor($this->branch);

        $payload = chairPayload($chair);
        unset($payload['barber_id']);
        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", $payload)->assertOk();
        expect($chair->fresh()->barber_id)->toBe($barber->id);

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", chairPayload($chair, ['barber_id' => null]))->assertOk();
        expect($chair->fresh()->barber_id)->toBeNull();
    });

    it('returns conflict when a future booking protects a chair from deactivation', function (): void {
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        BookingModel::factory()->create([
            'chair_id' => $chair->id,
            'booking_status' => BookingStatus::Pending->value,
            'ends_at' => now()->addHour(),
        ]);
        $this->authenticateDashboardActor($this->branch);

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", chairPayload($chair, [
            'status' => ChairStatus::Maintenance->value,
        ]))->assertConflict()->assertJsonPath('code', 'CHAIR_HAS_ACTIVE_BOOKINGS');
    });

    it('cancels and notifies future bookings when maintenance is forced', function (): void {
        Queue::fake();
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        $booking = BookingModel::factory()->create([
            'chair_id' => $chair->id,
            'booking_status' => BookingStatus::Confirmed->value,
            'starts_at' => now()->addHour(),
            'ends_at' => now()->addHours(2),
        ]);
        $this->authenticateDashboardActor($this->branch);

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", chairPayload($chair, [
            'status' => ChairStatus::Maintenance->value,
        ]))->assertConflict()->assertJsonPath('errors.booking_ids', [$booking->id]);
        expect($chair->fresh()->status)->toBe(ChairStatus::Available);

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", chairPayload($chair, [
            'status' => ChairStatus::Maintenance->value,
            'force' => true,
        ]))->assertOk()->assertJsonPath('meta.cancelled_booking_ids', [$booking->id]);

        expect($chair->fresh()->status)->toBe(ChairStatus::Maintenance);
        expect($booking->fresh()->booking_status)->toBe(BookingStatus::Cancelled);
        expect($booking->fresh()->cancellation_reason)->toBe('chair_maintenance');
        Queue::assertPushed(SendBookingStatusNotificationJob::class, 1);
    });

    it('returns conflict when a future booking protects a chair from deletion', function (): void {
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        BookingModel::factory()->create([
            'chair_id' => $chair->id,
            'booking_status' => BookingStatus::Confirmed->value,
            'ends_at' => now()->addHour(),
        ]);
        $this->authenticateDashboardActor($this->branch);

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
        'layout_settings' => [
            'position_x' => 10,
            'position_y' => 10,
            'width' => 60,
            'height' => 60,
        ],
    ], $overrides);
}

describe('Dashboard chair list filters', function (): void {
    beforeEach(function (): void {
        $this->brand = BrandModel::factory()->create();
        $this->first = BranchModel::factory()->create(['brand_id' => $this->brand->id]);
        $this->second = BranchModel::factory()->create(['brand_id' => $this->brand->id]);
    });

    it('filters chairs by stored status and floor zone', function (): void {
        $maintenance = ChairModel::factory()->create(['branch_id' => $this->first->id, 'status' => ChairStatus::Maintenance, 'floor_zone' => 'men']);
        ChairModel::factory()->create(['branch_id' => $this->first->id, 'status' => ChairStatus::Available, 'floor_zone' => 'women']);
        $this->authenticateDashboardActor($this->first);

        $this->getJson('/api/v1/dashboard/chairs?status=maintenance')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $maintenance->id);
        $this->getJson('/api/v1/dashboard/chairs?floor_zone=men')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $maintenance->id);
        $this->getJson('/api/v1/dashboard/chairs?status=bogus')->assertUnprocessable();
        $this->getJson('/api/v1/dashboard/chairs?floor_zone=bogus')->assertUnprocessable();
    });

    it('narrows an admin to one branch', function (): void {
        $a = ChairModel::factory()->create(['branch_id' => $this->first->id]);
        ChairModel::factory()->create(['branch_id' => $this->second->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson("/api/v1/dashboard/chairs?branch_id={$this->first->id}")
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $a->id);
    });

    it('never widens a manager scope through branch_id', function (): void {
        ChairModel::factory()->create(['branch_id' => $this->first->id]);
        ChairModel::factory()->create(['branch_id' => $this->second->id]);
        $this->authenticateDashboardActor($this->second);

        $this->getJson("/api/v1/dashboard/chairs?branch_id={$this->first->id}")
            ->assertOk()->assertJsonCount(0, 'data');
    });

    it('exposes the stored status separately from the live availability', function (): void {
        $chair = ChairModel::factory()->create(['branch_id' => $this->first->id, 'status' => ChairStatus::Available]);
        $this->authenticateDashboardActor($this->first);

        $this->getJson("/api/v1/dashboard/chairs/{$chair->id}")
            ->assertOk()
            ->assertJsonPath('data.configured_status', 'available')
            ->assertJsonPath('data.availability', 'available');
    });

    it('rejects a barber on the dashboard chair and review routes', function (): void {
        $barber = BarberModel::factory()->create();
        $this->authenticateDashboardActor($barber);

        $this->getJson('/api/v1/dashboard/chairs')->assertForbidden();
        $this->getJson("/api/v1/dashboard/branches/{$this->first->id}/reviews")->assertForbidden();
    });
});
