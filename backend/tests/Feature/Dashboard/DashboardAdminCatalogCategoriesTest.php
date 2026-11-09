<?php

declare(strict_types=1);

use Filament\Facades\Filament;
use Illuminate\Support\Facades\Gate;
use Livewire\Livewire;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Enums\VenueUniverse;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\ServiceCatalog\Filament\Panels\Admin\Resources\ServiceCatalogCategoryResource\Pages\ListServiceCatalogCategoriesPage;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

const ADMIN_CATALOG_URL = '/api/v1/dashboard/admin/catalog-categories';

beforeEach(function (): void {
    config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
});

/** @return array<string, mixed> */
function adminCategoryPayload(array $overrides = []): array
{
    return array_replace([
        'name' => ['en' => 'Beard care', 'ar' => 'العناية باللحية'],
        'description' => ['en' => 'Trims and shaping', 'ar' => null],
        'universe' => VenueUniverse::Men->value,
        'sort_order' => 4,
        'is_active' => true,
    ], $overrides);
}

describe('Admin catalog categories: list', function (): void {
    it('lists top-level categories with usage counts and read-only children', function (): void {
        $parent = ServiceCatalogCategoryModel::factory()->create(['sort_order' => 1]);
        ServiceCatalogCategoryModel::factory()->inactive()->create(['parent_id' => $parent->id]);
        $item = ServiceCatalogItemModel::factory()->create(['category_id' => $parent->id]);
        ServiceCatalogItemModel::factory()->create(['category_id' => $parent->id])->delete();
        OfferedServiceModel::factory()->create(['category_id' => $parent->id, 'catalog_item_id' => $item->id]);
        OfferedServiceModel::factory()->create(['catalog_item_id' => $item->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson(ADMIN_CATALOG_URL)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $parent->id)
            ->assertJsonPath('data.0.items_count', 1)
            ->assertJsonPath('data.0.children_count', 1)
            ->assertJsonPath('data.0.services_count', 2)
            ->assertJsonPath('data.0.children.0.is_active', false)
            ->assertJsonPath('data.0.children.0.items_count', 0);
    });

    it('filters the top level by status and by name or slug', function (): void {
        $active = ServiceCatalogCategoryModel::factory()->create(['name' => ['en' => 'Hair', 'ar' => 'شعر'], 'slug' => 'hair']);
        $inactive = ServiceCatalogCategoryModel::factory()->inactive()->create(['name' => ['en' => 'Nails', 'ar' => 'أظافر'], 'slug' => 'nails']);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson(ADMIN_CATALOG_URL.'?status=inactive')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $inactive->id);
        $this->getJson(ADMIN_CATALOG_URL.'?status=active')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $active->id);
        $this->getJson(ADMIN_CATALOG_URL.'?search=شعر')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $active->id);
        $this->getJson(ADMIN_CATALOG_URL.'?status=archived')->assertUnprocessable();
    });

    it('keeps the public categories payload unchanged', function (): void {
        $parent = ServiceCatalogCategoryModel::factory()->create();
        ServiceCatalogCategoryModel::factory()->create(['parent_id' => $parent->id]);

        $row = $this->getJson('/api/v1/service-catalog/categories')->assertOk()->json('data.0');

        expect(array_keys($row))->toBe(['id', 'name', 'description', 'slug', 'parent_id', 'universe', 'children', 'is_active', 'sort_order', 'created_at'])
            ->and($row)->not->toHaveKey('services_count');
    });
});

describe('Admin catalog categories: create, edit and toggle', function (): void {
    it('creates a category with a generated slug and the default audience', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson(ADMIN_CATALOG_URL, adminCategoryPayload(['universe' => 'kids']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['universe']);

        $payload = adminCategoryPayload();
        unset($payload['universe']);
        $response = $this->postJson(ADMIN_CATALOG_URL, $payload)
            ->assertCreated()
            ->assertJsonPath('data.name.ar', 'العناية باللحية')
            ->assertJsonPath('data.description', ['en' => 'Trims and shaping'])
            ->assertJsonPath('data.universe', VenueUniverse::Unisex->value)
            ->assertJsonPath('data.services_count', 0);

        expect($response->json('data.slug'))->toStartWith('beard-care-')
            ->and($response->json('data.parent_id'))->toBeNull();
    });

    it('rejects a duplicate name from either writer, ignoring deleted categories', function (): void {
        ServiceCatalogCategoryModel::factory()->create(['name' => ['en' => 'Beard care', 'ar' => 'لحية']]);
        ServiceCatalogCategoryModel::factory()->create(['name' => ['en' => 'Old', 'ar' => 'العناية باللحية']])->delete();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson(ADMIN_CATALOG_URL, adminCategoryPayload())->assertUnprocessable()->assertJsonValidationErrors(['name.en']);
        $this->postJson('/api/v1/dashboard/service-categories', ['name' => ['en' => 'Beard care', 'ar' => 'جديد']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name.en']);
        $this->postJson(ADMIN_CATALOG_URL, adminCategoryPayload(['name' => ['en' => 'Shaves', 'ar' => 'العناية باللحية']]))->assertCreated();
    });

    it('updates in place, keeping slug and parent and allowing its own name', function (): void {
        $category = ServiceCatalogCategoryModel::factory()->create([
            'name' => ['en' => 'Beard care', 'ar' => 'العناية باللحية'],
            'description' => ['en' => 'Old', 'ar' => 'قديم'],
            'slug' => 'beard-care',
        ]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson(ADMIN_CATALOG_URL."/{$category->id}", adminCategoryPayload(['description' => null, 'slug' => 'hijack', 'parent_id' => $category->id]))
            ->assertOk()
            ->assertJsonPath('data.slug', 'beard-care')
            ->assertJsonPath('data.parent_id', null)
            ->assertJsonPath('data.description', [])
            ->assertJsonPath('data.universe', VenueUniverse::Men->value)
            ->assertJsonPath('data.sort_order', 4);
    });

    it('toggles one category without cascading to its children', function (): void {
        $parent = ServiceCatalogCategoryModel::factory()->create();
        $child = ServiceCatalogCategoryModel::factory()->create(['parent_id' => $parent->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(ADMIN_CATALOG_URL."/{$parent->id}/active", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);
        $this->patchJson(ADMIN_CATALOG_URL."/{$parent->id}/active", [])->assertUnprocessable();

        expect($parent->refresh()->is_active)->toBeFalse()
            ->and($child->refresh()->is_active)->toBeTrue();
    });
});

describe('Admin catalog categories: delete', function (): void {
    it('soft-deletes an empty category', function (): void {
        $category = ServiceCatalogCategoryModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->deleteJson(ADMIN_CATALOG_URL."/{$category->id}")->assertOk();

        expect(ServiceCatalogCategoryModel::query()->find($category->id))->toBeNull()
            ->and(ServiceCatalogCategoryModel::withTrashed()->find($category->id))->not->toBeNull();
    });

    it('refuses a category in use with 409 and keeps it', function (string $usage): void {
        $category = ServiceCatalogCategoryModel::factory()->create();
        match ($usage) {
            'child' => ServiceCatalogCategoryModel::factory()->inactive()->create(['parent_id' => $category->id]),
            'item' => ServiceCatalogItemModel::factory()->create(['category_id' => $category->id]),
            'service' => OfferedServiceModel::factory()->create(['category_id' => $category->id]),
            'service through a deleted item' => tap(
                ServiceCatalogItemModel::factory()->create(['category_id' => $category->id]),
                fn (ServiceCatalogItemModel $item) => OfferedServiceModel::factory()->create(['catalog_item_id' => $item->id]),
            )->delete(),
        };
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->deleteJson(ADMIN_CATALOG_URL."/{$category->id}")
            ->assertStatus(409)
            ->assertJsonPath('code', ErrorCodeEnum::CONFLICT->value);

        expect(ServiceCatalogCategoryModel::query()->find($category->id))->not->toBeNull();
    })->with(['child', 'item', 'service', 'service through a deleted item']);

    it('no longer accepts a deleted category for a catalog item', function (): void {
        $category = ServiceCatalogCategoryModel::factory()->create();
        $item = ServiceCatalogItemModel::factory()->create();
        $category->delete();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson("/api/v1/dashboard/admin/catalog-items/{$item->id}", ['category_id' => $category->id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id']);
        $this->postJson('/api/v1/dashboard/admin/catalog-items', [
            'category_id' => $category->id,
            'name' => ['en' => 'Fade', 'ar' => 'فيد'],
            'slug' => 'fade-after-delete',
            'is_active' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors(['category_id']);
    });

    it('applies the same rule to the Filament delete action', function (): void {
        $empty = ServiceCatalogCategoryModel::factory()->create();
        $used = ServiceCatalogCategoryModel::factory()->create();
        ServiceCatalogItemModel::factory()->create(['category_id' => $used->id]);
        $this->actingAs(AdminModel::factory()->create(), 'admin');
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Livewire::test(ListServiceCatalogCategoriesPage::class)
            ->assertTableActionHidden('delete', $used)
            ->assertTableActionVisible('delete', $empty)
            ->callTableAction('delete', $empty);

        expect(ServiceCatalogCategoryModel::query()->find($empty->id))->toBeNull()
            ->and(ServiceCatalogCategoryModel::query()->find($used->id))->not->toBeNull();
    });
});

describe('Admin catalog categories: authorization', function (): void {
    it('forbids managers, owners and barbers on every category route', function (): void {
        $category = ServiceCatalogCategoryModel::factory()->create();
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);

        foreach ([BranchModel::factory()->create(), $owner, BarberModel::factory()->create()] as $actor) {
            $this->authenticateDashboardActor($actor);
            $this->getJson(ADMIN_CATALOG_URL)->assertForbidden();
            $this->postJson(ADMIN_CATALOG_URL, adminCategoryPayload())->assertForbidden();
            $this->putJson(ADMIN_CATALOG_URL."/{$category->id}", adminCategoryPayload())->assertForbidden();
            $this->patchJson(ADMIN_CATALOG_URL."/{$category->id}/active", ['is_active' => false])->assertForbidden();
            $this->deleteJson(ADMIN_CATALOG_URL."/{$category->id}")->assertForbidden();
        }

        expect($category->refresh()->is_active)->toBeTrue()
            ->and(ServiceCatalogCategoryModel::query()->count())->toBe(1);
    });

    it('denies the policy to anything but an admin', function (): void {
        $category = ServiceCatalogCategoryModel::factory()->create();

        expect(Gate::forUser(AdminModel::factory()->create())->allows('delete', $category))->toBeTrue()
            ->and(Gate::forUser(BranchModel::factory()->create())->allows('update', $category))->toBeFalse()
            ->and(Gate::forUser(null)->allows('create', ServiceCatalogCategoryModel::class))->toBeFalse();
    });
});

describe('Owner services and inactive categories', function (): void {
    it('keeps a service in its category after an admin deactivates it, but refuses new links', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $currency = CurrencyModel::factory()->create();
        $inactive = ServiceCatalogCategoryModel::factory()->create();
        $otherInactive = ServiceCatalogCategoryModel::factory()->inactive()->create();
        $service = OfferedServiceModel::factory()->create(['serviceable_id' => $brand->id, 'category_id' => $inactive->id, 'currency_code' => $currency->code]);
        $inactive->update(['is_active' => false]);
        $payload = [
            'serviceable_id' => $brand->id,
            'serviceable_type' => ServiceableTypeEnum::Brand,
            'currency_code' => $currency->code,
            'name' => ['en' => 'Fade', 'ar' => 'فيد'],
            'price_amount_minor' => 3000,
        ];
        $this->authenticateDashboardActor($owner);

        $this->putJson("/api/v1/dashboard/services/{$service->id}", [...$payload, 'category_id' => $inactive->id])->assertOk();
        $this->putJson("/api/v1/dashboard/services/{$service->id}", [...$payload, 'category_id' => $otherInactive->id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id']);
        $this->postJson('/api/v1/dashboard/services', [...$payload, 'category_id' => $inactive->id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id']);
    });
});
