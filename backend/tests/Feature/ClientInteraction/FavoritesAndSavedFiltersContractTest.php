<?php

declare(strict_types=1);

use Illuminate\Support\Str;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientInteraction\Enums\FavoritedTypeEnum;
use Modules\ClientInteraction\Models\ClientFavoriteModel;

beforeEach(function () {
    $this->client = ClientModel::factory()->create();
});

it('is idempotent when the same favorite is added twice, returning 200 on the second call', function () {
    $branch = BranchModel::factory()->create();

    $first = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/favorites', ['favorited_id' => $branch->id, 'favorited_type' => FavoritedTypeEnum::Branch]);
    $second = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/favorites', ['favorited_id' => $branch->id, 'favorited_type' => FavoritedTypeEnum::Branch]);

    $first->assertCreated();
    $second->assertOk();
    expect(ClientFavoriteModel::query()->where('client_id', $this->client->id)->count())->toBe(1);
});

it('rejects a favorited_id that does not exist for its type with a 422', function () {
    $response = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/favorites', ['favorited_id' => (string) Str::uuid(), 'favorited_type' => FavoritedTypeEnum::Branch]);

    $response->assertStatus(422)->assertJsonValidationErrors('favorited_id');
});

it('saves and reads back a price_range filter unchanged', function () {
    $create = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/saved-filters', [
            'name' => 'Nearby cheap',
            'filter_criteria' => ['price_range' => ['min' => 10, 'max' => 50]],
        ]);
    $create->assertCreated()->assertJsonPath('data.filter_criteria.price_range', ['min' => 10, 'max' => 50]);

    $filterId = $create->json('data.id');

    $show = $this->actingAs($this->client, 'client')->getJson("/api/v1/client/saved-filters/{$filterId}");

    $show->assertOk()->assertJsonPath('data.filter_criteria.price_range', ['min' => 10, 'max' => 50]);
});

it('still accepts legacy price_min/price_max and reads it back as price_range', function () {
    $create = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/saved-filters', [
            'name' => 'Legacy filter',
            'filter_criteria' => ['price_min' => 5, 'price_max' => 20],
        ]);

    $create->assertCreated()->assertJsonPath('data.filter_criteria.price_range', ['min' => 5, 'max' => 20]);
    $create->assertJsonMissingPath('data.filter_criteria.price_min');
});
