<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Broadcast;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Enums\FloorPlanPreset;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

it('serves the public health and service catalog detail API envelopes', function (): void {
    $this->getJson('/api/v1/health')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['status']]);

    $item = ServiceCatalogItemModel::factory()->create();
    $this->getJson("/api/v1/service-catalog/items/{$item->id}")
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.id', $item->id);
});

it('requires a barber token and scopes today appointments to that barber', function (): void {
    $this->getJson('/api/v1/barber/appointments/today')->assertUnauthorized();

    $barber = BarberModel::factory()->create();
    $other = BarberModel::factory()->create();
    $chair = ChairModel::factory()->create();
    $own = BookingModel::factory()->create([
        'barber_id' => $barber->id,
        'chair_id' => $chair->id,
        'time_slot' => today()->setTime(12, 0),
        'ends_at' => today()->setTime(12, 30),
    ]);
    BookingModel::factory()->create([
        'barber_id' => $other->id,
        'time_slot' => today()->setTime(13, 0),
        'ends_at' => today()->setTime(13, 30),
    ]);

    $this->actingAs($barber, 'barber')->getJson('/api/v1/barber/appointments/today')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonFragment(['id' => $own->id])
        ->assertJsonMissing(['id' => $other->id]);
});

it('updates only the authenticated barber workstation status', function (): void {
    $this->patchJson('/api/v1/barber/workstation-status', ['online' => true])->assertUnauthorized();

    $barber = BarberModel::factory()->create(['is_workstation_online' => false]);
    $this->actingAs($barber, 'barber')
        ->patchJson('/api/v1/barber/workstation-status', ['online' => true])
        ->assertOk()
        ->assertJsonPath('data.is_workstation_online', true);
    expect($barber->fresh()->is_workstation_online)->toBeTrue();
    $this->patchJson('/api/v1/barber/workstation-status', ['online' => 'invalid'])->assertUnprocessable();
});

it('lists branch chairs and saves a valid floor plan only for the signed-in branch', function (): void {
    $this->getJson('/api/v1/branch/chairs')->assertUnauthorized();
    $this->patchJson('/api/v1/branch/floor-plan', [])->assertUnauthorized();
    $branch = BranchModel::factory()->create();
    $other = BranchModel::factory()->create();
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
    ChairModel::factory()->create(['branch_id' => $other->id]);
    $this->actingAs($branch, 'branch_api');

    $this->getJson('/api/v1/branch/chairs')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(1, 'data')
        ->assertJsonFragment(['id' => $chair->id]);
    $this->patchJson('/api/v1/branch/floor-plan', ['preset' => FloorPlanPreset::UnisexZoned->value, 'zones' => [['zone' => 'men']]])
        ->assertUnprocessable();
    $this->patchJson('/api/v1/branch/floor-plan', ['preset' => FloorPlanPreset::UnisexZoned->value, 'zones' => [
        ['zone' => 'men', 'x' => 0, 'y' => 0, 'width' => 50, 'height' => 100],
        ['zone' => 'women', 'x' => 50, 'y' => 0, 'width' => 50, 'height' => 100],
    ]])
        ->assertOk()
        ->assertJsonPath('data.preset', FloorPlanPreset::UnisexZoned->value);
    expect($branch->fresh()->floor_plan_preset)->toBe(FloorPlanPreset::UnisexZoned);
});

it('records the current branch booking status behavior pending Task 18 transition rules', function (): void {
    $this->patchJson('/api/v1/branch/bookings/missing/status', ['status' => BookingStatus::InProgress])->assertUnauthorized();
    $branch = BranchModel::factory()->create();
    $other = BranchModel::factory()->create();
    $own = BookingModel::factory()->create(['chair_id' => ChairModel::factory()->create(['branch_id' => $branch->id])->id]);
    $foreign = BookingModel::factory()->create(['chair_id' => ChairModel::factory()->create(['branch_id' => $other->id])->id]);
    $this->actingAs($branch, 'branch_api');

    $this->patchJson("/api/v1/branch/bookings/{$foreign->id}/status", ['status' => BookingStatus::InProgress])->assertNotFound();
    $this->patchJson("/api/v1/branch/bookings/{$own->id}/status", ['status' => BookingStatus::InProgress])
        ->assertOk()
        ->assertJsonPath('data.status', BookingStatus::InProgress->value);
    expect($own->fresh()->status)->toBe(BookingStatus::InProgress);
})->group('known-defect');

it('serves dashboard profile, booking status, branch update, and chair create routes', function (): void {
    $this->getJson('/api/v1/dashboard/profile')->assertUnauthorized();
    $guardedBranch = BranchModel::factory()->create();
    $this->putJson("/api/v1/dashboard/branches/{$guardedBranch->id}", [])->assertUnauthorized();
    $this->postJson('/api/v1/dashboard/chairs', [])->assertUnauthorized();
    $this->patchJson('/api/v1/dashboard/bookings/'.fake()->uuid(), [])->assertUnauthorized();
    $admin = AdminModel::factory()->create();
    $this->authenticateDashboardActor($admin);

    $this->getJson('/api/v1/dashboard/profile')->assertOk()->assertJsonPath('success', true);
    $branch = BranchModel::factory()->create();
    $this->putJson("/api/v1/dashboard/branches/{$branch->id}", [])->assertUnprocessable();
    $this->putJson("/api/v1/dashboard/branches/{$branch->id}", [
        'brand_id' => $branch->brand_id,
        'name' => ['en' => 'Updated', 'ar' => 'محدث'],
        'email' => 'updated-branch@example.test',
    ])
        ->assertOk()->assertJsonPath('success', true);
    $this->postJson('/api/v1/dashboard/chairs', [
        'branch_id' => $branch->id,
        'label' => 'C-17',
        'floor_zone' => 'shared',
        'status' => ChairStatus::Available,
        'ui_metadata' => ['position_x' => 1, 'position_y' => 2, 'width' => 50, 'height' => 50],
    ])->assertCreated();
    $createdChair = ChairModel::query()->where('label', 'C-17')->firstOrFail();
    $booking = BookingModel::factory()->create(['chair_id' => $createdChair->id]);
    $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}", ['status' => BookingStatus::Canceled->value])
        ->assertOk()->assertJsonPath('data.status', BookingStatus::Canceled->value);
    expect($booking->fresh()->status)->toBe(BookingStatus::Canceled);
});

it('keeps dashboard branch and chair writes inside a branch manager tenant', function (): void {
    $branch = BranchModel::factory()->create();
    $foreignBranch = BranchModel::factory()->create();
    $this->authenticateDashboardActor($branch);

    $this->putJson("/api/v1/dashboard/branches/{$foreignBranch->id}", [
        'brand_id' => $foreignBranch->brand_id,
        'name' => ['en' => 'Foreign', 'ar' => 'خارجي'],
        'email' => 'foreign-updated@example.test',
    ])->assertForbidden();
    $this->postJson('/api/v1/dashboard/chairs', [
        'branch_id' => $foreignBranch->id,
        'label' => 'Foreign Chair',
        'floor_zone' => 'shared',
        'status' => ChairStatus::Available,
        'ui_metadata' => ['position_x' => 1, 'position_y' => 2, 'width' => 50, 'height' => 50],
    ])->assertForbidden();

    $ownChair = ChairModel::factory()->create(['branch_id' => $branch->id]);
    $foreignChair = ChairModel::factory()->create(['branch_id' => $foreignBranch->id]);
    $foreignBooking = BookingModel::factory()->create(['chair_id' => $foreignChair->id]);
    $this->patchJson("/api/v1/dashboard/bookings/{$foreignBooking->id}", ['status' => BookingStatus::Canceled->value])
        ->assertNotFound();
    $this->patchJson('/api/v1/dashboard/bookings/'.BookingModel::factory()->create(['chair_id' => $ownChair->id])->id, [])->assertUnprocessable();

    $service = OfferedServiceModel::factory()->create(['serviceable_id' => $foreignBranch->brand_id]);
    $this->postJson('/api/v1/dashboard/bookings/walk-in', [
        'branch_id' => $foreignBranch->id,
        'chair_id' => $foreignChair->id,
        'customer_name' => 'Tenant Boundary',
        'customer_email' => 'tenant-boundary@example.test',
        'service_ids' => [$service->id],
        'time_slot' => now()->addDay()->toIso8601String(),
    ])->assertForbidden();
});

it('exercises the dashboard walk-in route validation and authorization', function (): void {
    $this->postJson('/api/v1/dashboard/bookings/walk-in', [])->assertUnauthorized();
    $admin = AdminModel::factory()->create();
    $this->authenticateDashboardActor($admin);
    $this->postJson('/api/v1/dashboard/bookings/walk-in', [])->assertUnprocessable();

    $branch = BranchModel::factory()->create();
    $barber = BarberModel::factory()->create(['managed_by_branch_id' => $branch->id]);
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);
    $service = OfferedServiceModel::factory()->create(['serviceable_id' => $branch->brand_id, 'duration' => 30]);
    $response = $this->postJson('/api/v1/dashboard/bookings/walk-in', [
        'branch_id' => $branch->id,
        'chair_id' => $chair->id,
        'barber_id' => $barber->id,
        'customer_name' => 'Walk In Customer',
        'customer_email' => 'walk-in@example.test',
        'service_ids' => [$service->id],
        'time_slot' => now()->addDay()->toIso8601String(),
    ])->assertCreated()->assertJsonPath('success', true);
    $this->assertDatabaseHas('bookings', ['id' => $response->json('data.id'), 'chair_id' => $chair->id]);
});

it('requires branch authentication for managed barber creation and validates its payload', function (): void {
    $this->postJson('/api/v1/branch/barbers', [])->assertUnauthorized();
    $branch = BranchModel::factory()->create();
    $this->actingAs($branch, 'branch_api')
        ->postJson('/api/v1/branch/barbers', [])
        ->assertUnprocessable();
    $this->postJson('/api/v1/branch/barbers', ['name' => ['en' => 'Managed Stylist', 'ar' => 'حلاق'], 'phone' => '+963944123456'])
        ->assertCreated();
});

it('authorizes owners and denies foreign actors on private barber and branch channels', function (): void {
    $barber = BarberModel::factory()->create();
    $branch = BranchModel::factory()->create();
    $foreignBarber = BarberModel::factory()->create();
    $foreignBranch = BranchModel::factory()->create();
    ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);
    $channels = Broadcast::getChannels();

    expect($channels->get('barber.{barberId}')($barber, $barber->id))->toBeTrue()
        ->and($channels->get('barber.{barberId}')($barber, $foreignBarber->id))->toBeFalse()
        ->and($channels->get('branch.{branchId}')($barber, $branch->id))->toBeTrue()
        ->and($channels->get('branch.{branchId}')($barber, $foreignBranch->id))->toBeFalse();
    $this->postJson('/api/v1/broadcasting/auth', [])->assertUnauthorized();
});
