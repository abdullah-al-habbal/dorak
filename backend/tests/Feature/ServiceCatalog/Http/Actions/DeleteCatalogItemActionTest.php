<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

it('rejects branch and barber attempts to delete a catalog item without changing it', function (): void {
    $item = ServiceCatalogItemModel::factory()->create();

    foreach ([BranchModel::factory()->create(), BarberModel::factory()->create()] as $actor) {
        $this->authenticateDashboardActor($actor)
            ->deleteJson("/api/v1/dashboard/admin/catalog-items/{$item->id}")
            ->assertForbidden();
    }

    $this->assertDatabaseHas('service_catalog_items', ['id' => $item->id, 'deleted_at' => null]);
});

it('allows an admin to delete a catalog item', function (): void {
    $item = ServiceCatalogItemModel::factory()->create();
    $admin = AdminModel::factory()->create();

    $this->authenticateDashboardActor($admin)
        ->deleteJson("/api/v1/dashboard/admin/catalog-items/{$item->id}")
        ->assertOk();

    $this->assertSoftDeleted('service_catalog_items', ['id' => $item->id]);
});
