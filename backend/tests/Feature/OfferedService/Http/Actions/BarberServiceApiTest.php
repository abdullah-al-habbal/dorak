<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
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
        'currency_code' => $currency->code,
        'name' => ['en' => 'Beard Trim', 'ar' => 'تهذيب اللحية'],
        'price_amount_minor' => 1500,
        'duration_minutes' => 20,
        'is_active' => true,
    ], $overrides);
}

it('creates a service forced to the authenticated barber regardless of payload', function (): void {
    $currency = CurrencyModel::factory()->create();

    $this->postJson('/api/v1/barber/services', barberServicePayload($currency))
        ->assertCreated()
        ->assertJsonPath('data.serviceable_id', $this->barber->id)
        ->assertJsonPath('data.serviceable_type', ServiceableTypeEnum::Barber->value);
});

it('persists at_home on a barber-owned service', function (): void {
    $currency = CurrencyModel::factory()->create();

    $this->postJson('/api/v1/barber/services', barberServicePayload($currency, ['is_at_home' => true]))
        ->assertCreated()
        ->assertJsonPath('data.is_at_home', true);
    $this->assertDatabaseHas('offered_services', [
        'serviceable_id' => $this->barber->id,
        'serviceable_type' => ServiceableTypeEnum::Barber,
        'is_at_home' => true,
    ]);
});

it('lists only the authenticated barber\'s own services', function (): void {
    $currency = CurrencyModel::factory()->create();
    $own = OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => $this->barber->id]);
    OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => $this->other->id]);

    $this->getJson('/api/v1/barber/services')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $own->id);
});

it('forbids updating another barber\'s service', function (): void {
    $currency = CurrencyModel::factory()->create();
    $service = OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => $this->other->id]);

    $this->putJson("/api/v1/barber/services/{$service->id}", barberServicePayload($currency))
        ->assertNotFound();
});

it('forbids deleting another barber\'s service', function (): void {
    $service = OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => $this->other->id]);

    $this->deleteJson("/api/v1/barber/services/{$service->id}")->assertNotFound();
});

it('updates and deletes its own service', function (): void {
    $currency = CurrencyModel::factory()->create();
    $service = OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => $this->barber->id]);

    $this->putJson("/api/v1/barber/services/{$service->id}", barberServicePayload($currency, ['price_amount_minor' => 4000]))
        ->assertOk()
        ->assertJsonPath('data.price_amount_minor', 4000);
    $this->deleteJson("/api/v1/barber/services/{$service->id}")->assertOk();
    $this->assertDatabaseMissing('offered_services', ['id' => $service->id]);
});
