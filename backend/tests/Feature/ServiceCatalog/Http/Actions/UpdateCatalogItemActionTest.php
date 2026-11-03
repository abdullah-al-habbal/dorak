<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

it('rejects branch and barber attempts to update a catalog item without changing it', function (): void {
    $item = ServiceCatalogItemModel::factory()->create(['slug' => 'original-service']);

    foreach ([BranchModel::factory()->create(), BarberModel::factory()->create()] as $actor) {
        $this->authenticateDashboardActor($actor)
            ->putJson("/api/v1/dashboard/admin/catalog-items/{$item->id}", ['slug' => 'changed-service'])
            ->assertForbidden();
    }

    expect($item->refresh()->slug)->toBe('original-service');
});

it('allows an admin to update a catalog item', function (): void {
    $item = ServiceCatalogItemModel::factory()->create(['slug' => 'original-service']);
    $admin = AdminModel::factory()->create();

    $this->authenticateDashboardActor($admin)
        ->putJson("/api/v1/dashboard/admin/catalog-items/{$item->id}", ['slug' => 'updated-service'])
        ->assertOk()
        ->assertJsonPath('data.slug', 'updated-service');

    expect($item->refresh()->slug)->toBe('updated-service');
});
