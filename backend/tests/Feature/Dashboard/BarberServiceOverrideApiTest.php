<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\BarberServiceOverrideModel;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    $this->owner = ClientModel::factory()->create();
    $this->brand = BrandModel::factory()->create(['owner_id' => $this->owner->id]);
    $this->branch = BranchModel::factory()->create(['brand_id' => $this->brand->id]);
    $this->barber = BarberModel::factory()->create(['managed_by_branch_id' => $this->branch->id]);
    $this->service = OfferedServiceModel::factory()->create([
        'serviceable_type' => ServiceableTypeEnum::Barber,
        'serviceable_id' => $this->barber->id,
        'price_amount_minor' => 2000,
        'duration_minutes' => 30,
    ]);
    $this->overrideUrl = fn (?BarberModel $barber = null, ?OfferedServiceModel $service = null): string => '/api/v1/dashboard/barbers/'.($barber ?? $this->barber)->id.'/services/'.($service ?? $this->service)->id.'/override';
    $this->payload = fn (array $extra = []): array => array_merge(['brand_id' => $this->brand->id, 'price_amount_minor' => 3500, 'duration_minutes' => 45], $extra);
});

describe('PUT /dashboard/barbers/{barber}/services/{service}/override', function (): void {
    it('lets the owner set a price and duration while the barber default stays intact', function (): void {
        $this->authenticateDashboardActor($this->owner)
            ->putJson(($this->overrideUrl)(), ($this->payload)())
            ->assertOk()
            ->assertJsonPath('data.id', $this->service->id)
            ->assertJsonPath('data.price_amount_minor', 3500)
            ->assertJsonPath('data.duration_minutes', 45)
            ->assertJsonPath('data.is_overridden', true)
            ->assertJsonPath('data.default_price_amount_minor', 2000)
            ->assertJsonPath('data.default_duration_minutes', 30);

        $this->assertDatabaseHas('barber_service_overrides', [
            'offered_service_id' => $this->service->id,
            'brand_id' => $this->brand->id,
            'price_amount_minor' => 3500,
            'duration_minutes' => 45,
        ]);
        $this->assertDatabaseHas('offered_services', ['id' => $this->service->id, 'price_amount_minor' => 2000, 'duration_minutes' => 30]);
    });

    it('falls back to the default for the field the override leaves out', function (): void {
        $this->authenticateDashboardActor($this->owner)
            ->putJson(($this->overrideUrl)(), ($this->payload)(['duration_minutes' => null]))
            ->assertOk()
            ->assertJsonPath('data.price_amount_minor', 3500)
            ->assertJsonPath('data.duration_minutes', 30);
    });

    it('updates the existing override instead of adding a second one', function (): void {
        $this->authenticateDashboardActor($this->owner);

        $this->putJson(($this->overrideUrl)(), ($this->payload)())->assertOk();
        $this->putJson(($this->overrideUrl)(), ($this->payload)(['price_amount_minor' => 4100]))->assertOk()
            ->assertJsonPath('data.price_amount_minor', 4100);

        expect(BarberServiceOverrideModel::query()->count())->toBe(1);
    });

    it('lets a platform admin override for any brand', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create())
            ->putJson(($this->overrideUrl)(), ($this->payload)())
            ->assertOk()
            ->assertJsonPath('data.price_amount_minor', 3500);
    });

    it('accepts a barber affiliated with the brand but not one with a pending invite', function (): void {
        $affiliated = BarberModel::factory()->create();
        $pending = BarberModel::factory()->create();
        BarberAffiliationModel::factory()->create(['barber_id' => $affiliated->id, 'affiliable_id' => $this->brand->id, 'affiliable_type' => AffiliableType::Brand]);
        BarberAffiliationModel::factory()->pending()->create(['barber_id' => $pending->id, 'affiliable_id' => $this->branch->id, 'affiliable_type' => AffiliableType::Branch]);
        $affiliatedService = OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => $affiliated->id]);
        $pendingService = OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => $pending->id]);
        $this->authenticateDashboardActor($this->owner);

        $this->putJson(($this->overrideUrl)($affiliated, $affiliatedService), ($this->payload)())->assertOk();
        $this->putJson(($this->overrideUrl)($pending, $pendingService), ($this->payload)())->assertForbidden();
    });

    it('forbids an owner of another brand', function (): void {
        $foreignOwner = ClientModel::factory()->create();
        $foreignBrand = BrandModel::factory()->create(['owner_id' => $foreignOwner->id]);

        $this->authenticateDashboardActor($foreignOwner);
        $this->putJson(($this->overrideUrl)(), ($this->payload)())->assertForbidden();
        $this->putJson(($this->overrideUrl)(), ($this->payload)(['brand_id' => $foreignBrand->id]))->assertForbidden();

        $this->assertDatabaseCount('barber_service_overrides', 0);
    });

    it('forbids an owner overriding a barber who does not work for their brand', function (): void {
        $strangerService = OfferedServiceModel::factory()->create([
            'serviceable_type' => ServiceableTypeEnum::Barber,
            'serviceable_id' => ($stranger = BarberModel::factory()->create())->id,
        ]);

        $this->authenticateDashboardActor($this->owner)
            ->putJson(($this->overrideUrl)($stranger, $strangerService), ($this->payload)())
            ->assertForbidden();

        $this->assertDatabaseCount('barber_service_overrides', 0);
    });

    it('forbids branch managers and barbers', function (): void {
        $this->authenticateDashboardActor($this->branch)
            ->putJson(($this->overrideUrl)(), ($this->payload)())
            ->assertForbidden();
        $this->authenticateDashboardActor($this->barber)
            ->putJson(($this->overrideUrl)(), ($this->payload)())
            ->assertForbidden();

        $this->assertDatabaseCount('barber_service_overrides', 0);
    });

    it('rejects a request that overrides nothing or is out of range', function (): void {
        $this->authenticateDashboardActor($this->owner);

        $this->putJson(($this->overrideUrl)(), ['brand_id' => $this->brand->id])->assertUnprocessable();
        $this->putJson(($this->overrideUrl)(), ($this->payload)(['price_amount_minor' => -1]))->assertUnprocessable();
        $this->putJson(($this->overrideUrl)(), ($this->payload)(['duration_minutes' => 0]))->assertUnprocessable();
        $this->putJson(($this->overrideUrl)(), ($this->payload)(['duration_minutes' => 1441]))->assertUnprocessable();
        $this->putJson(($this->overrideUrl)(), ['price_amount_minor' => 3500])->assertUnprocessable();
    });

    it('returns 404 for a service the barber does not own', function (): void {
        $otherService = OfferedServiceModel::factory()->create([
            'serviceable_type' => ServiceableTypeEnum::Barber,
            'serviceable_id' => BarberModel::factory()->create()->id,
        ]);

        $this->authenticateDashboardActor($this->owner)
            ->putJson(($this->overrideUrl)(null, $otherService), ($this->payload)())
            ->assertNotFound();
    });
});

describe('DELETE /dashboard/barbers/{barber}/services/{service}/override', function (): void {
    it('removes the override so the barber default applies again', function (): void {
        BarberServiceOverrideModel::factory()->create(['offered_service_id' => $this->service->id, 'brand_id' => $this->brand->id]);

        $this->authenticateDashboardActor($this->owner)
            ->deleteJson(($this->overrideUrl)().'?brand_id='.$this->brand->id)
            ->assertOk();

        $this->assertDatabaseCount('barber_service_overrides', 0);
        $this->assertDatabaseHas('offered_services', ['id' => $this->service->id, 'price_amount_minor' => 2000]);
    });

    it('does not touch another brand\'s override', function (): void {
        $otherBrand = BrandModel::factory()->create();
        BarberServiceOverrideModel::factory()->create(['offered_service_id' => $this->service->id, 'brand_id' => $otherBrand->id]);

        $this->authenticateDashboardActor($this->owner)
            ->deleteJson(($this->overrideUrl)().'?brand_id='.$this->brand->id)
            ->assertOk();

        $this->assertDatabaseHas('barber_service_overrides', ['offered_service_id' => $this->service->id, 'brand_id' => $otherBrand->id]);
    });

    it('forbids a foreign owner and a branch manager', function (): void {
        $override = BarberServiceOverrideModel::factory()->create(['offered_service_id' => $this->service->id, 'brand_id' => $this->brand->id]);
        $foreignOwner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $foreignOwner->id]);

        $this->authenticateDashboardActor($foreignOwner)
            ->deleteJson(($this->overrideUrl)().'?brand_id='.$this->brand->id)
            ->assertForbidden();
        $this->authenticateDashboardActor($this->branch)
            ->deleteJson(($this->overrideUrl)().'?brand_id='.$this->brand->id)
            ->assertForbidden();

        $this->assertModelExists($override);
    });
});

describe('GET /dashboard/barbers/{barber}/services', function (): void {
    it('lists a barber\'s services at the brand\'s terms next to the defaults', function (): void {
        $plain = OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => $this->barber->id, 'price_amount_minor' => 900, 'duration_minutes' => 15]);
        BarberServiceOverrideModel::factory()->create(['offered_service_id' => $this->service->id, 'brand_id' => $this->brand->id, 'price_amount_minor' => 3500, 'duration_minutes' => 45]);

        $rows = $this->authenticateDashboardActor($this->owner)
            ->getJson('/api/v1/dashboard/barbers/'.$this->barber->id.'/services?brand_id='.$this->brand->id)
            ->assertOk()
            ->json('data');

        $byId = collect($rows)->keyBy('id');
        expect($byId[$this->service->id])->toMatchArray(['price_amount_minor' => 3500, 'duration_minutes' => 45, 'is_overridden' => true, 'default_price_amount_minor' => 2000])
            ->and($byId[$plain->id])->toMatchArray(['price_amount_minor' => 900, 'duration_minutes' => 15, 'is_overridden' => false]);
    });

    it('forbids a foreign owner', function (): void {
        $foreignOwner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $foreignOwner->id]);

        $this->authenticateDashboardActor($foreignOwner)
            ->getJson('/api/v1/dashboard/barbers/'.$this->barber->id.'/services?brand_id='.$this->brand->id)
            ->assertForbidden();
    });
});
