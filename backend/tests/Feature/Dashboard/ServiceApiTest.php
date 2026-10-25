<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Models\OfferedServiceModel;

describe('Dashboard Service API', function (): void {
    beforeEach(function (): void {
        $this->admin = AdminModel::factory()->create();
        $this->branch = BranchModel::factory()->create();
        $this->otherBranch = BranchModel::factory()->create();
    });

    it('lets an admin create a brand-owned service', function (): void {
        $this->authenticateDashboardActor($this->admin);
        $currency = CurrencyModel::factory()->create();

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch->brand_id, $currency))
            ->assertCreated()
            ->assertJsonPath('data.serviceable_id', $this->branch->brand_id)
            ->assertJsonPath('data.serviceable_type', 'brand');
    });

    it('rejects a branch serviceable_type (D1: owned by brand or barber, never branch)', function (): void {
        $this->authenticateDashboardActor($this->admin);
        $currency = CurrencyModel::factory()->create();

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch->id, $currency, ['serviceable_type' => 'branch']))
            ->assertUnprocessable();
    });

    it('accepts and persists at_home', function (): void {
        $this->authenticateDashboardActor($this->admin);
        $currency = CurrencyModel::factory()->create();

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch->brand_id, $currency, ['at_home' => true]))
            ->assertCreated()
            ->assertJsonPath('data.at_home', true);
        $this->assertDatabaseHas('offered_services', ['at_home' => true, 'serviceable_id' => $this->branch->brand_id]);
    });

    it('lets an admin update and delete a service', function (): void {
        $service = OfferedServiceModel::factory()->create(['serviceable_id' => $this->branch->brand_id]);
        $this->authenticateDashboardActor($this->admin);
        $currency = CurrencyModel::factory()->create();

        $this->putJson("/api/v1/dashboard/services/{$service->id}", servicePayload($this->branch->brand_id, $currency, ['price' => 31]))
            ->assertOk()
            ->assertJsonPath('data.price', 31);
        $this->deleteJson("/api/v1/dashboard/services/{$service->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/services/{$service->id}")->assertNotFound();
    });

    it('scopes a branch manager to services owned by its brand', function (): void {
        $own = OfferedServiceModel::factory()->create(['serviceable_id' => $this->branch->brand_id]);
        $other = OfferedServiceModel::factory()->create(['serviceable_id' => $this->otherBranch->brand_id]);
        $this->authenticateDashboardActor($this->branch);

        $this->getJson("/api/v1/dashboard/services/{$own->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/services/{$other->id}")->assertNotFound();
        $this->getJson('/api/v1/dashboard/services')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('rejects a branch manager attempting to create a service for another brand', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $currency = CurrencyModel::factory()->create();

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->otherBranch->brand_id, $currency))
            ->assertForbidden();
    });

    it('lets a branch manager create a service for its own brand', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $currency = CurrencyModel::factory()->create();

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch->brand_id, $currency))
            ->assertCreated()
            ->assertJsonPath('data.serviceable_id', $this->branch->brand_id);
    });
});

function servicePayload(string $brandId, CurrencyModel $currency, array $overrides = []): array
{
    return array_replace([
        'serviceable_id' => $brandId,
        'serviceable_type' => 'brand',
        'catalog_item_id' => null,
        'currency_id' => $currency->id,
        'name' => ['en' => 'Haircut', 'ar' => 'قص شعر'],
        'price' => 25,
        'duration' => 30,
        'active' => true,
    ], $overrides);
}
