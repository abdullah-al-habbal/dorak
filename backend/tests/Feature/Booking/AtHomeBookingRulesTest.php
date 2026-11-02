<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    $this->barber = BarberModel::factory()->create([
        'latitude' => 33.5,
        'longitude' => 36.3,
        'travel_radius_km' => 10,
    ]);
    $this->service = OfferedServiceModel::factory()->atHome()->create([
        'serviceable_type' => ServiceableTypeEnum::Barber,
        'serviceable_id' => $this->barber->id,
        'duration_minutes' => 30,
    ]);
    $this->slot = Carbon::tomorrow()->startOfDay()->addHours(10);
    $this->actingAs(ClientModel::factory()->create(), 'client');
    $this->book = fn (array $overrides = [], array $location = []) => $this->postJson('/api/v1/bookings', array_merge([
        'barber_id' => $this->barber->id,
        'at_home_location' => array_merge([
            'latitude' => 33.51,
            'longitude' => 36.31,
            'street' => 'Al Hamra Street',
            'building' => '12',
            'unit' => '4B',
        ], $location),
        'time_slot' => $this->slot->toIso8601String(),
        'service_ids' => [$this->service->id],
    ], $overrides));
});

it('books an at-home barber inside the travel radius', function (): void {
    ($this->book)()->assertCreated()->assertJsonPath('data.barber.id', $this->barber->id);
});

it('requires a barber', function (): void {
    ($this->book)(['barber_id' => null])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'at_home_barber_required');

    expect(BookingModel::query()->count())->toBe(0);
});

it('rejects a service that is not flagged at home', function (): void {
    $service = OfferedServiceModel::factory()->create([
        'serviceable_type' => ServiceableTypeEnum::Barber,
        'serviceable_id' => $this->barber->id,
        'duration_minutes' => 30,
        'is_at_home' => false,
    ]);

    ($this->book)(['service_ids' => [$service->id]])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'at_home_service_not_eligible');
});

it('rejects an at-home service owned by someone else', function (): void {
    $service = OfferedServiceModel::factory()->atHome()->create([
        'serviceable_type' => ServiceableTypeEnum::Barber,
        'serviceable_id' => BarberModel::factory()->create()->id,
        'duration_minutes' => 30,
    ]);

    ($this->book)(['service_ids' => [$service->id]])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'at_home_service_not_eligible');
});

it('rejects a client outside the travel radius', function (): void {
    ($this->book)([], ['latitude' => 34.5, 'longitude' => 36.3])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'at_home_out_of_radius');

    expect(BookingModel::query()->count())->toBe(0);
});

it('treats a null travel radius as not offering at home', function (): void {
    $this->barber->update(['travel_radius_km' => null]);

    ($this->book)()->assertUnprocessable()->assertJsonPath('code', 'at_home_not_offered');
});

it('lets an affiliated barber work at home', function (): void {
    BarberAffiliationModel::factory()->create([
        'barber_id' => $this->barber->id,
        'affiliable_id' => BranchModel::factory()->create()->id,
    ]);

    ($this->book)()->assertCreated();
});

it('rejects an at-home booking that overlaps the barber calendar', function (): void {
    ($this->book)()->assertCreated();

    ($this->book)()->assertStatus(409);
});

it('applies the same rules to the barber slot endpoint', function (): void {
    $query = fn (array $extra): string => '/api/v1/barbers/'.$this->barber->id.'/slots?'.http_build_query(array_merge([
        'date' => $this->slot->format('Y-m-d'),
        'service_ids' => [$this->service->id],
        'is_at_home' => 1,
    ], $extra));

    $this->getJson($query(['latitude' => 33.51, 'longitude' => 36.31]))->assertOk();
    $this->getJson($query(['latitude' => 34.5, 'longitude' => 36.3]))
        ->assertUnprocessable()
        ->assertJsonPath('code', 'at_home_out_of_radius');
    $this->getJson($query([]))->assertUnprocessable();
});
