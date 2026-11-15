<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\ServiceCatalog\Database\Factories\ServiceCatalogCategoryFactory;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

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
            ->assertJsonPath('data.serviceable_type', ServiceableTypeEnum::Brand->value);
    });

    it('returns the catalog category on listed services and lists currencies', function (): void {
        $this->authenticateDashboardActor($this->admin);
        $currency = CurrencyModel::factory()->create();
        $category = ServiceCatalogCategoryModel::factory()->create();
        $item = ServiceCatalogItemModel::factory()->create(['category_id' => $category->id]);
        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch->brand_id, $currency, ['catalog_item_id' => $item->id]))->assertCreated();

        $this->getJson('/api/v1/dashboard/services')
            ->assertOk()
            ->assertJsonPath('data.0.category.id', $category->id);
        $this->getJson('/api/v1/dashboard/currencies')
            ->assertOk()
            ->assertJsonFragment(['code' => $currency->code]);
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

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch->brand_id, $currency, ['is_at_home' => true]))
            ->assertCreated()
            ->assertJsonPath('data.is_at_home', true);
        $this->assertDatabaseHas('offered_services', ['is_at_home' => true, 'serviceable_id' => $this->branch->brand_id]);
    });

    it('lets an admin update and delete a service', function (): void {
        $service = OfferedServiceModel::factory()->create(['serviceable_id' => $this->branch->brand_id]);
        $this->authenticateDashboardActor($this->admin);
        $currency = CurrencyModel::factory()->create();

        $this->putJson("/api/v1/dashboard/services/{$service->id}", servicePayload($this->branch->brand_id, $currency, ['price_amount_minor' => 3100]))
            ->assertOk()
            ->assertJsonPath('data.price_amount_minor', 3100);
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

    it('lists service categories for a branch manager but leaves creating them to the platform admin (F-02)', function (): void {
        $existing = ServiceCatalogCategoryFactory::new()->create();
        $this->authenticateDashboardActor($this->branch);

        $this->getJson('/api/v1/dashboard/service-categories')
            ->assertOk()
            ->assertJsonFragment(['id' => $existing->id]);
        $this->postJson('/api/v1/dashboard/service-categories', ['name' => ['en' => 'Bridal', 'ar' => 'عرائس']])->assertForbidden();
        $this->assertDatabaseMissing('service_catalog_categories', ['name->en' => 'Bridal']);
    });

    it('refuses a brand owner creating a global service category and keeps existing categories', function (): void {
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        $existing = ServiceCatalogCategoryFactory::new()->create();
        $this->authenticateDashboardActor($owner);

        $this->postJson('/api/v1/dashboard/service-categories', ['name' => ['en' => 'Bridal', 'ar' => 'عرائس']])->assertForbidden();
        $this->getJson('/api/v1/dashboard/service-categories')->assertOk()->assertJsonFragment(['id' => $existing->id]);
        $this->assertDatabaseMissing('service_catalog_categories', ['name->en' => 'Bridal']);
    });

    it('lets the platform admin create a global service category', function (): void {
        $this->authenticateDashboardActor($this->admin);

        $this->postJson('/api/v1/dashboard/service-categories', ['name' => ['en' => 'Bridal', 'ar' => 'عرائس']])
            ->assertCreated()
            ->assertJsonPath('data.name.en', 'Bridal');
        $this->assertDatabaseHas('service_catalog_categories', ['is_active' => true, 'name->en' => 'Bridal']);
    });

    it('blocks barbers from the service category endpoints', function (): void {
        $this->authenticateDashboardActor(BarberModel::factory()->create());

        $this->getJson('/api/v1/dashboard/service-categories')->assertForbidden();
        $this->postJson('/api/v1/dashboard/service-categories', ['name' => ['en' => 'Nails', 'ar' => 'أظافر']])->assertForbidden();
    });

    it('rejects a duplicate or incomplete category name', function (): void {
        ServiceCatalogCategoryModel::factory()->create(['name' => ['en' => 'Bridal', 'ar' => 'عرائس']]);
        $this->authenticateDashboardActor($this->admin);

        $this->postJson('/api/v1/dashboard/service-categories', ['name' => ['en' => 'Bridal', 'ar' => 'زفاف']])
            ->assertUnprocessable();
        $this->postJson('/api/v1/dashboard/service-categories', ['name' => ['en' => 'Nails']])
            ->assertUnprocessable();
    });

    it('assigns a category directly to a service and prefers it over the catalog item category', function (): void {
        $this->authenticateDashboardActor($this->admin);
        $currency = CurrencyModel::factory()->create();
        $direct = ServiceCatalogCategoryModel::factory()->create();
        $viaItem = ServiceCatalogCategoryModel::factory()->create();
        $item = ServiceCatalogItemModel::factory()->create(['category_id' => $viaItem->id]);

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch->brand_id, $currency, ['category_id' => $direct->id, 'catalog_item_id' => $item->id]))
            ->assertCreated()
            ->assertJsonPath('data.category.id', $direct->id);
        $this->getJson('/api/v1/dashboard/services')->assertJsonPath('data.0.category.id', $direct->id);
    });

    it('rejects an inactive or unknown service category', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $currency = CurrencyModel::factory()->create();
        $inactive = ServiceCatalogCategoryModel::factory()->inactive()->create();

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch->brand_id, $currency, ['category_id' => $inactive->id]))
            ->assertUnprocessable();
    });

    it('rejects a branch manager attempting to create a service for another brand', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $currency = CurrencyModel::factory()->create();

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->otherBranch->brand_id, $currency))
            ->assertForbidden();
    });

    it('refuses a branch manager creating a service for its own brand (F-07, decision C)', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $currency = CurrencyModel::factory()->create();

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch->brand_id, $currency))->assertForbidden();
        $this->assertDatabaseMissing('offered_services', ['serviceable_id' => $this->branch->brand_id]);
    });

    it('refuses a branch manager updating or deleting a brand service but keeps it readable (F-07)', function (): void {
        $service = OfferedServiceModel::factory()->create(['serviceable_id' => $this->branch->brand_id, 'price_amount_minor' => 1000]);
        $currency = CurrencyModel::factory()->create();
        $this->authenticateDashboardActor($this->branch);

        $this->putJson("/api/v1/dashboard/services/{$service->id}", servicePayload($this->branch->brand_id, $currency, ['price_amount_minor' => 9900]))
            ->assertForbidden();
        $this->deleteJson("/api/v1/dashboard/services/{$service->id}")->assertForbidden();
        $this->getJson("/api/v1/dashboard/services/{$service->id}")->assertOk()->assertJsonPath('data.price_amount_minor', 1000);
        $this->assertDatabaseHas('offered_services', ['id' => $service->id, 'price_amount_minor' => 1000]);
    });

    it('lets a brand owner create, update and delete services of its own brand (F-07)', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $currency = CurrencyModel::factory()->create();
        $this->authenticateDashboardActor($owner);

        $id = $this->postJson('/api/v1/dashboard/services', servicePayload($brand->id, $currency))
            ->assertCreated()->json('data.id');
        $this->putJson("/api/v1/dashboard/services/{$id}", servicePayload($brand->id, $currency, ['price_amount_minor' => 3300]))
            ->assertOk()->assertJsonPath('data.price_amount_minor', 3300);
        $this->deleteJson("/api/v1/dashboard/services/{$id}")->assertOk();
    });

    it('refuses a brand owner writing services of another brand (F-07)', function (): void {
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        $foreign = OfferedServiceModel::factory()->create(['serviceable_id' => $this->branch->brand_id]);
        $currency = CurrencyModel::factory()->create();
        $this->authenticateDashboardActor($owner);

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch->brand_id, $currency))->assertForbidden();
        $this->putJson("/api/v1/dashboard/services/{$foreign->id}", servicePayload($this->branch->brand_id, $currency))->assertNotFound();
        $this->deleteJson("/api/v1/dashboard/services/{$foreign->id}")->assertNotFound();
    });
});

function servicePayload(string $brandId, CurrencyModel $currency, array $overrides = []): array
{
    return array_replace([
        'serviceable_id' => $brandId,
        'serviceable_type' => ServiceableTypeEnum::Brand,
        'catalog_item_id' => null,
        'currency_code' => $currency->code,
        'name' => ['en' => 'Haircut', 'ar' => 'قص شعر'],
        'price_amount_minor' => 2500,
        'duration_minutes' => 30,
        'is_active' => true,
    ], $overrides);
}
