<?php

declare(strict_types=1);

use Modules\Client\Models\ClientModel;
use Modules\Core\Models\DeviceTokenModel;

it('registers and refreshes the authenticated client device token', function () {
    $client = ClientModel::factory()->create();
    $this->actingAs($client, 'client');

    $response = $this->postJson('/api/v1/user/device-token', [
        'token' => 'mobile-device-token',
        'platform' => 'android',
    ]);

    $response->assertOk()->assertJsonStructure(['data' => ['id']]);
    $this->assertDatabaseHas('device_tokens', [
        'token' => 'mobile-device-token',
        'user_id' => $client->id,
        'user_type' => ClientModel::class,
        'platform' => 'android',
    ]);

    $this->postJson('/api/v1/user/device-token', [
        'token' => 'mobile-device-token',
        'platform' => 'ios',
    ])->assertOk();

    expect(DeviceTokenModel::query()->where('token', 'mobile-device-token')->count())->toBe(1);
    $this->assertDatabaseHas('device_tokens', ['token' => 'mobile-device-token', 'platform' => 'ios']);
});
