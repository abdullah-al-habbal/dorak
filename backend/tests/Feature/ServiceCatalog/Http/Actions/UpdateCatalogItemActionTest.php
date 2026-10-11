<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

it('rejects branch and client attempts to update a catalog item without changing it', function (): void {
    $item = ServiceCatalogItemModel::factory()->create(['slug' => 'original-service']);

    foreach ([
        [BranchModel::factory()->create(), 'branch_api'],
        [ClientModel::factory()->create(), 'client'],
    ] as [$actor, $guard]) {
        $this->actingAs($actor, $guard)
            ->putJson("/api/v1/service-catalog/items/{$item->id}", ['slug' => 'changed-service'])
            ->assertUnauthorized();
    }

    expect($item->refresh()->slug)->toBe('original-service');
});

it('allows an admin to update a catalog item', function (): void {
    $item = ServiceCatalogItemModel::factory()->create(['slug' => 'original-service']);
    $admin = AdminModel::factory()->create();

    $this->actingAs($admin, 'admin_api')
        ->putJson("/api/v1/service-catalog/items/{$item->id}", ['slug' => 'updated-service'])
        ->assertOk()
        ->assertJsonPath('data.slug', 'updated-service');

    expect($item->refresh()->slug)->toBe('updated-service');
});
