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

it('saves and returns the style attributes and price range of a catalog item (FT-12)', function (): void {
    $item = ServiceCatalogItemModel::factory()->create();
    $admin = AdminModel::factory()->create();
    $attributes = [
        'maintenance_level' => 'medium',
        'style_period_type' => 'modern',
        'formality_level' => 'formal',
        'face_shapes' => ['oval', 'round'],
        'hair_textures' => ['wavy'],
        'price_range' => ['min' => 1000, 'max' => 2500, 'currency' => 'USD'],
    ];

    $this->authenticateDashboardActor($admin)
        ->putJson("/api/v1/dashboard/admin/catalog-items/{$item->id}", $attributes)
        ->assertOk()
        ->assertJsonPath('data.formality_level', 'formal')
        ->assertJsonPath('data.maintenance_level', 'medium')
        ->assertJsonPath('data.face_shapes', ['oval', 'round'])
        ->assertJsonPath('data.price_range.max', 2500);

    $this->putJson("/api/v1/dashboard/admin/catalog-items/{$item->id}", ['maintenance_level' => null, 'formality_level' => null, 'price_range' => null, 'face_shapes' => []])
        ->assertOk()
        ->assertJsonPath('data.formality_level', null)
        ->assertJsonPath('data.maintenance_level', null)
        ->assertJsonPath('data.price_range', null)
        ->assertJsonPath('data.face_shapes', [])
        ->assertJsonPath('data.style_period_type', 'modern');
});

it('leaves a column alone when its key is missing from the update (FT-12)', function (): void {
    $item = ServiceCatalogItemModel::factory()->create(['default_duration_minutes' => 30, 'slug' => 'keep-me']);

    $this->authenticateDashboardActor(AdminModel::factory()->create())
        ->putJson("/api/v1/dashboard/admin/catalog-items/{$item->id}", ['slug' => 'renamed'])
        ->assertOk();

    expect($item->refresh()->default_duration_minutes)->toBe(30);

    $this->putJson("/api/v1/dashboard/admin/catalog-items/{$item->id}", ['default_duration_minutes' => null])->assertOk();

    expect($item->refresh()->default_duration_minutes)->toBeNull();
});

it('rejects a price range whose maximum is below its minimum (FT-12)', function (): void {
    $item = ServiceCatalogItemModel::factory()->create();

    $this->authenticateDashboardActor(AdminModel::factory()->create())
        ->putJson("/api/v1/dashboard/admin/catalog-items/{$item->id}", ['price_range' => ['min' => 2000, 'max' => 1000, 'currency' => 'USD']])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('price_range.max');
});
