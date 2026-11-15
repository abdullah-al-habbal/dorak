<?php

declare(strict_types=1);

use Modules\Client\Models\ClientModel;
use Modules\Language\Models\LanguageModel;
use Modules\Preference\Models\PreferenceModel;

function clientSettingsToken(ClientModel $client): string
{
    return $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;
}

it('rejects a switched-off language in a new preference update', function (): void {
    LanguageModel::factory()->create(['code' => 'ar', 'is_active' => false]);
    $client = ClientModel::factory()->create();

    $this->withToken(clientSettingsToken($client))
        ->patchJson('/api/v1/client/settings', ['preferred_language' => 'ar'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['preferred_language']);

    expect(PreferenceModel::query()->where('preferred_language', 'ar')->exists())->toBeFalse();
});

it('accepts an active language and still ignores unrelated updates for a user on an inactive one', function (): void {
    LanguageModel::factory()->create(['code' => 'en', 'is_active' => true]);
    LanguageModel::factory()->create(['code' => 'ar', 'is_active' => false]);
    $client = ClientModel::factory()->create();
    $token = clientSettingsToken($client);
    PreferenceModel::factory()->create([
        'preferenceable_type' => 'client',
        'preferenceable_id' => $client->id,
        'preferred_language' => 'ar',
    ]);

    $this->withToken($token)->patchJson('/api/v1/client/settings', ['allows_notifications' => false])
        ->assertOk()
        ->assertJsonPath('data.preferred_language', 'ar');

    $this->withToken($token)->patchJson('/api/v1/client/settings', ['preferred_language' => 'en'])
        ->assertOk()
        ->assertJsonPath('data.preferred_language', 'en');
});
