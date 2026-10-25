<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    $this->barber = BarberModel::factory()->create();
    $this->other = BarberModel::factory()->create();
    $this->actingAs($this->barber, 'barber');
});

function barberServicePayload(CurrencyModel $currency, array $overrides = []): array
{
    return array_replace([
        'catalog_item_id' => null,
        'currency_id' => $currency->id,
        'name' => ['en' => 'Beard Trim', 'ar' => 'تهذيب اللحية'],
        'price' => 15,
        'duration' => 20,
        'active' => true,
    ], $overrides);
}

it('creates a service forced to the authenticated barber regardless of payload', function (): void {
    $currency = CurrencyModel::factory()->create();

    $this->postJson('/api/v1/barber/services', barberServicePayload($currency))
        ->assertCreated()
        ->assertJsonPath('data.serviceable_id', $this->barber->id)
        ->assertJsonPath('data.serviceable_type', 'barber');
});

it('persists at_home on a barber-owned service', function (): void {
    $currency = CurrencyModel::factory()->create();

    $this->postJson('/api/v1/barber/services', barberServicePayload($currency, ['at_home' => true]))
        ->assertCreated()
        ->assertJsonPath('data.at_home', true);
    $this->assertDatabaseHas('offered_services', [
        'serviceable_id' => $this->barber->id,
        'serviceable_type' => 'barber',
        'at_home' => true,
    ]);
});

it('lists only the authenticated barber\'s own services', function (): void {
    $currency = CurrencyModel::factory()->create();
    $own = OfferedServiceModel::factory()->create(['serviceable_type' => 'barber', 'serviceable_id' => $this->barber->id]);
    OfferedServiceModel::factory()->create(['serviceable_type' => 'barber', 'serviceable_id' => $this->other->id]);

    $this->getJson('/api/v1/barber/services')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $own->id);
});

it('forbids updating another barber\'s service', function (): void {
    $currency = CurrencyModel::factory()->create();
    $service = OfferedServiceModel::factory()->create(['serviceable_type' => 'barber', 'serviceable_id' => $this->other->id]);

    $this->putJson("/api/v1/barber/services/{$service->id}", barberServicePayload($currency))
        ->assertNotFound();
});

it('forbids deleting another barber\'s service', function (): void {
    $service = OfferedServiceModel::factory()->create(['serviceable_type' => 'barber', 'serviceable_id' => $this->other->id]);

    $this->deleteJson("/api/v1/barber/services/{$service->id}")->assertNotFound();
});

it('updates and deletes its own service', function (): void {
    $currency = CurrencyModel::factory()->create();
    $service = OfferedServiceModel::factory()->create(['serviceable_type' => 'barber', 'serviceable_id' => $this->barber->id]);

    $this->putJson("/api/v1/barber/services/{$service->id}", barberServicePayload($currency, ['price' => 40]))
        ->assertOk()
        ->assertJsonPath('data.price', 40);
    $this->deleteJson("/api/v1/barber/services/{$service->id}")->assertOk();
    $this->assertDatabaseMissing('offered_services', ['id' => $service->id]);
});
