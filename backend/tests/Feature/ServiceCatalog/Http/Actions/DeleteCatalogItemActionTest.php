<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

it('rejects branch and client attempts to delete a catalog item without changing it', function (): void {
    $item = ServiceCatalogItemModel::factory()->create();

    foreach ([
        [BranchModel::factory()->create(), 'branch_api'],
        [ClientModel::factory()->create(), 'client'],
    ] as [$actor, $guard]) {
        $this->actingAs($actor, $guard)
            ->deleteJson("/api/v1/service-catalog/items/{$item->id}")
            ->assertUnauthorized();
    }

    $this->assertDatabaseHas('service_catalog_items', ['id' => $item->id, 'deleted_at' => null]);
});

it('allows an admin to delete a catalog item', function (): void {
    $item = ServiceCatalogItemModel::factory()->create();
    $admin = AdminModel::factory()->create();

    $this->actingAs($admin, 'admin_api')
        ->deleteJson("/api/v1/service-catalog/items/{$item->id}")
        ->assertOk();

    $this->assertSoftDeleted('service_catalog_items', ['id' => $item->id]);
});
