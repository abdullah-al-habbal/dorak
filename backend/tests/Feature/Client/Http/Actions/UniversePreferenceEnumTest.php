<?php

declare(strict_types=1);

use Modules\Client\Enums\UniverseEnum;
use Modules\Client\Models\ClientModel;

it('stores the preferred universe as an enum', function (): void {
    $client = ClientModel::factory()->create(['preferred_universe' => UniverseEnum::Men]);
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $this->withToken($token)
        ->patchJson('/api/v1/client/preferences/universe', ['universe' => UniverseEnum::Women->value])
        ->assertOk();

    expect($client->fresh()->preferred_universe)->toBe(UniverseEnum::Women);
});

it('rejects a universe outside the client enum', function (string $universe): void {
    $client = ClientModel::factory()->create();
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $this->withToken($token)
        ->patchJson('/api/v1/client/preferences/universe', ['universe' => $universe])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('universe');
})->with(['all', 'unisex', 'kids']);
