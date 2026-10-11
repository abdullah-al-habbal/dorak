<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

beforeEach(function () {
    $this->category = ServiceCatalogCategoryModel::factory()->create();
});

it('rejects a branch attempting to create a catalog item', function () {
    $branch = BranchModel::factory()->create();
    $this->actingAs($branch, 'branch_api');
    $payload = [
        'category_id' => $this->category->id,
        'name' => ['en' => 'Classic Haircut', 'ar' => 'حلاقة كلاسيكية'],
        'slug' => 'classic-haircut',
        'is_active' => true,
    ];

    $response = $this->postJson('/api/v1/service-catalog/items', $payload);

    $response->assertUnauthorized();
    $this->assertDatabaseMissing('service_catalog_items', ['slug' => 'classic-haircut']);
});

it('requires category_id', function () {
    $admin = AdminModel::factory()->create();
    $this->actingAs($admin, 'admin_api');
    $response = $this->postJson('/api/v1/service-catalog/items', [
        'name' => ['en' => 'Test', 'ar' => 'اختبار'],
        'slug' => 'test',
        'is_active' => true,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['category_id']);
});

it('requires unique slug', function () {
    $admin = AdminModel::factory()->create();
    $this->actingAs($admin, 'admin_api');
    $payload = [
        'category_id' => $this->category->id,
        'name' => ['en' => 'First', 'ar' => 'الأول'],
        'slug' => 'duplicate',
        'is_active' => true,
    ];
    $this->postJson('/api/v1/service-catalog/items', $payload);

    $response = $this->postJson('/api/v1/service-catalog/items', $payload);
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['slug']);
});

it('rejects a client attempting to create a catalog item', function () {
    $client = ClientModel::factory()->create();
    $this->actingAs($client, 'client');

    $response = $this->postJson('/api/v1/service-catalog/items', [
        'category_id' => $this->category->id,
        'name' => ['en' => 'Test', 'ar' => 'اختبار'],
        'slug' => 'test',
        'is_active' => true,
    ]);

    $response->assertUnauthorized();
    $this->assertDatabaseMissing('service_catalog_items', ['slug' => 'test']);
});

it('allows an admin to create a catalog item', function () {
    $admin = AdminModel::factory()->create();
    $this->actingAs($admin, 'admin_api');

    $response = $this->postJson('/api/v1/service-catalog/items', [
        'category_id' => $this->category->id,
        'name' => ['en' => 'Admin Service', 'ar' => 'خدمة المدير'],
        'slug' => 'admin-service',
        'is_active' => true,
    ]);

    $response->assertCreated();
});

it('requires authentication', function () {
    $response = $this->postJson('/api/v1/service-catalog/items', [
        'category_id' => $this->category->id,
        'name' => ['en' => 'Test', 'ar' => 'اختبار'],
        'slug' => 'test',
    ]);

    $response->assertUnauthorized();
});
