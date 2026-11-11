<?php

declare(strict_types=1);

use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientInteraction\Enums\FavoritedTypeEnum;

beforeEach(function () {
    $this->client = ClientModel::factory()->create();
    $this->actingAs($this->client, 'client');
});

// Favorites
it('lists empty favorites', function () {
    $response = $this->getJson('/api/v1/client/favorites?per_page=20');

    $response->assertOk();
    expect($response->json('data'))->toBeArray();
    expect($response->json('data'))->toHaveCount(0);
});

it('adds a favorite', function () {
    $brand = BrandModel::factory()->create();

    $response = $this->postJson('/api/v1/client/favorites', [
        'favorited_id' => $brand->id,
        'favorited_type' => FavoritedTypeEnum::Brand,
    ]);

    $response->assertCreated();
    expect($response->json('data'))->toHaveKeys(['id', 'favorited_id', 'favorited_type', 'created_at']);
    expect($response->json('data.favorited_type'))->toBe(FavoritedTypeEnum::Brand->value);
});

it('returns 422 for invalid favorited_type', function () {
    $response = $this->postJson('/api/v1/client/favorites', [
        'favorited_id' => 'some-id',
        'favorited_type' => 'invalid_type',
    ]);

    $response->assertStatus(422);
});

it('removes a favorite', function () {
    $brand = BrandModel::factory()->create();

    $fav = $this->postJson('/api/v1/client/favorites', [
        'favorited_id' => $brand->id,
        'favorited_type' => FavoritedTypeEnum::Brand,
    ])->json('data');

    $response = $this->deleteJson("/api/v1/client/favorites/{$fav['id']}");

    $response->assertOk();
});

it('fails favorites without auth', function () {
    $this->app->get('auth')->forgetGuards();

    $response = $this->getJson('/api/v1/client/favorites');

    $response->assertUnauthorized();
});

// Saved Filters
it('creates and lists saved filters', function () {
    $this->postJson('/api/v1/client/saved-filters', [
        'name' => 'My Filter',
        'filter_criteria' => ['universe' => 'men', 'radius' => 10],
    ])->assertCreated();

    $response = $this->getJson('/api/v1/client/saved-filters');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.name'))->toBe('My Filter');
});

it('shows a saved filter', function () {
    $created = $this->postJson('/api/v1/client/saved-filters', [
        'name' => 'My Filter',
        'filter_criteria' => ['universe' => 'men'],
    ])->json('data');

    $response = $this->getJson("/api/v1/client/saved-filters/{$created['id']}");

    $response->assertOk();
    expect($response->json('data.name'))->toBe('My Filter');
});

it('updates a saved filter', function () {
    $created = $this->postJson('/api/v1/client/saved-filters', [
        'name' => 'My Filter',
        'filter_criteria' => ['universe' => 'men'],
    ])->json('data');

    $response = $this->putJson("/api/v1/client/saved-filters/{$created['id']}", [
        'name' => 'Updated Filter',
        'filter_criteria' => ['universe' => 'women'],
    ]);

    $response->assertOk();
    expect($response->json('data.name'))->toBe('Updated Filter');
});

it('deletes a saved filter', function () {
    $created = $this->postJson('/api/v1/client/saved-filters', [
        'name' => 'My Filter',
        'filter_criteria' => ['universe' => 'men'],
    ])->json('data');

    $response = $this->deleteJson("/api/v1/client/saved-filters/{$created['id']}");

    $response->assertOk();
});

it('returns 422 creating saved filter without name', function () {
    $response = $this->postJson('/api/v1/client/saved-filters', [
        'filter_criteria' => ['universe' => 'men'],
    ]);

    $response->assertStatus(422);
});

// Discovery Preferences
it('returns default discovery preferences', function () {
    $response = $this->getJson('/api/v1/client/discovery-preferences');

    $response->assertOk();
    expect($response->json('data'))->toHaveKeys(['id', 'preferred_universe', 'default_radius_km', 'hidden_brand_ids', 'allows_unavailable_results']);
});

it('updates discovery preferences', function () {
    $response = $this->patchJson('/api/v1/client/discovery-preferences', [
        'default_radius_km' => 50,
    ]);

    $response->assertOk();
    expect((int) $response->json('data.default_radius_km'))->toBe(50);
});

it('blocks saved filters without auth', function () {
    $this->app->get('auth')->forgetGuards();

    $response = $this->getJson('/api/v1/client/saved-filters');

    $response->assertUnauthorized();
});

it('blocks discovery preferences without auth', function () {
    $this->app->get('auth')->forgetGuards();

    $response = $this->getJson('/api/v1/client/discovery-preferences');

    $response->assertUnauthorized();
});

it('does not let another client update or delete a saved filter', function () {
    $created = $this->postJson('/api/v1/client/saved-filters', [
        'name' => 'My Filter',
        'filter_criteria' => ['universe' => 'men'],
    ])->json('data');

    $this->actingAs(ClientModel::factory()->create(), 'client');

    $this->putJson("/api/v1/client/saved-filters/{$created['id']}", [
        'name' => 'Stolen',
        'filter_criteria' => ['universe' => 'women'],
    ])->assertNotFound();
    // A delete is scoped by client: for a foreign id it is the same silent no-op as for a missing one.
    $this->deleteJson("/api/v1/client/saved-filters/{$created['id']}")->assertOk();

    $this->actingAs($this->client, 'client');
    expect($this->getJson("/api/v1/client/saved-filters/{$created['id']}")->json('data.name'))->toBe('My Filter');
});
