<?php

declare(strict_types=1);

use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;

it('never exposes the owner on the public brand page', function (): void {
    $owner = ClientModel::factory()->create(['email' => 'owner-private@example.test']);
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);

    $response = $this->getJson("/api/v1/brands/{$brand->id}");

    $response->assertOk();
    expect($response->json('data'))->not->toHaveKeys(['owner', 'status_reason', 'submission_count']);
    expect($response->getContent())->not->toContain('owner-private@example.test');
});

it('never exposes the owner on the public brand list', function (): void {
    $owner = ClientModel::factory()->create(['email' => 'owner-private@example.test']);
    BrandModel::factory()->create(['owner_id' => $owner->id]);

    $response = $this->getJson('/api/v1/brands');

    $response->assertOk();
    expect($response->json('data'))->not->toBeEmpty();
    expect($response->getContent())->not->toContain('owner-private@example.test')
        ->and($response->getContent())->not->toContain('"owner"');
});

it('keeps the owner on the brand the owner manages', function (): void {
    $owner = ClientModel::factory()->create();
    $this->actingAs($owner, 'client');
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);

    $this->putJson("/api/v1/brands/{$brand->id}", ['name' => ['en' => 'Renamed']])
        ->assertOk()
        ->assertJsonPath('data.name.en', 'Renamed');
});
