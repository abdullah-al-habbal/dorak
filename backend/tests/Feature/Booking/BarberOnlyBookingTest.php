<?php

declare(strict_types=1);

use Carbon\Carbon;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    $this->branch = BranchModel::factory()->create();
    $this->barber = BarberModel::factory()->create();
    BarberAffiliationModel::factory()->create([
        'barber_id' => $this->barber->id,
        'affiliable_id' => $this->branch->id,
    ]);
    $this->service = OfferedServiceModel::factory()->create([
        'serviceable_type' => 'brand',
        'serviceable_id' => $this->branch->brand_id,
        'duration' => 30,
    ]);
    $this->slot = Carbon::tomorrow()->startOfDay()->addHours(10);
    $this->actingAs(ClientModel::factory()->create(), 'client');
    $this->book = fn (array $overrides = []) => $this->postJson('/api/v1/bookings', array_merge([
        'barber_id' => $this->barber->id,
        'branch_id' => $this->branch->id,
        'time_slot' => $this->slot->toIso8601String(),
        'service_ids' => [$this->service->id],
    ], $overrides));
});

it('books an affiliated barber without a chair', function (): void {
    ($this->book)()
        ->assertCreated()
        ->assertJsonPath('data.chair', null)
        ->assertJsonPath('data.barber.id', $this->barber->id);

    $this->assertDatabaseHas('bookings', [
        'chair_id' => null,
        'branch_id' => $this->branch->id,
        'barber_id' => $this->barber->id,
    ]);
});

it('rejects a branch where the barber has no accepted affiliation', function (): void {
    $other = BranchModel::factory()->create();

    ($this->book)(['branch_id' => $other->id])->assertUnprocessable();

    $this->assertDatabaseCount('bookings', 0);
});

it('rejects a pending affiliation', function (): void {
    BarberAffiliationModel::query()->delete();
    BarberAffiliationModel::factory()->pending()->create([
        'barber_id' => $this->barber->id,
        'affiliable_id' => $this->branch->id,
    ]);

    ($this->book)()->assertUnprocessable();
});

it('rejects a request with none of chair, barber plus branch, or at-home', function (): void {
    $this->postJson('/api/v1/bookings', [
        'time_slot' => $this->slot->toIso8601String(),
        'service_ids' => [$this->service->id],
    ])->assertUnprocessable();

    ($this->book)(['branch_id' => null])->assertUnprocessable();
    ($this->book)(['barber_id' => null])->assertUnprocessable();
});

it('still rejects chair_id combined with at_home_location', function (): void {
    $this->postJson('/api/v1/bookings', [
        'chair_id' => (string) Str::uuid(),
        'at_home_location' => ['latitude' => 33.5, 'longitude' => 36.3, 'street' => 's', 'building' => '1', 'unit' => '1'],
        'time_slot' => $this->slot->toIso8601String(),
        'service_ids' => [$this->service->id],
    ])->assertUnprocessable();
});

it('returns 409 when the barber is already booked at that time', function (): void {
    ($this->book)()->assertCreated();
    ($this->book)()->assertStatus(409);
});

it('lists the barber-only booking in the branch bookings', function (): void {
    ($this->book)()->assertCreated();

    $this->actingAs($this->branch, 'branch_api');

    $this->getJson('/api/v1/branch/bookings')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});
