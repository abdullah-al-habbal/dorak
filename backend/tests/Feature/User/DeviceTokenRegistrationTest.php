<?php

declare(strict_types=1);

use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Models\DeviceTokenModel;

it('registers and refreshes the authenticated client device token', function () {
    $client = ClientModel::factory()->create();
    $this->actingAs($client, 'client');

    $response = $this->postJson('/api/v1/user/device-token', [
        'token' => 'mobile-device-token',
        'platform_type' => 'android',
    ]);

    $response->assertOk()->assertJsonStructure(['data' => ['id']]);
    $this->assertDatabaseHas('device_tokens', [
        'token' => 'mobile-device-token',
        'user_id' => $client->id,
        'user_type' => DeviceTokenUserTypeEnum::Client,
        'platform_type' => 'android',
    ]);

    $this->postJson('/api/v1/user/device-token', [
        'token' => 'mobile-device-token',
        'platform_type' => 'ios',
    ])->assertOk();

    expect(DeviceTokenModel::query()->where('token', 'mobile-device-token')->count())->toBe(1);
    $this->assertDatabaseHas('device_tokens', ['token' => 'mobile-device-token', 'platform_type' => 'ios']);
});

it('stores the device locale and app version and links the token to the sign-in', function () {
    $client = ClientModel::factory()->create();
    $plain = $client->createToken('phone')->plainTextToken;

    $this->withToken($plain)->postJson('/api/v1/user/device-token', [
        'token' => 'versioned-token',
        'platform_type' => 'ios',
        'locale' => 'ar',
        'app_version' => '1.4.2+7',
    ])->assertOk();

    $row = DeviceTokenModel::query()->where('token', 'versioned-token')->firstOrFail();
    expect($row->locale)->toBe('ar')
        ->and($row->app_version)->toBe('1.4.2+7')
        ->and($row->getAttribute('access_token_id'))->toBe($client->tokens()->firstOrFail()->getKey())
        ->and($row->revoked_at)->toBeNull();
});

it('rejects an unsupported locale and an oversized app version', function () {
    $this->actingAs(ClientModel::factory()->create(), 'client');

    $this->postJson('/api/v1/user/device-token', [
        'token' => 'bad-token',
        'platform_type' => 'android',
        'locale' => 'fr',
        'app_version' => str_repeat('1', 33),
    ])->assertUnprocessable()->assertJsonValidationErrors(['locale', 'app_version']);
});

it('requires authentication to register or revoke a token', function () {
    $this->postJson('/api/v1/user/device-token', ['token' => 't', 'platform_type' => 'android'])->assertUnauthorized();
    $this->deleteJson('/api/v1/user/device-token', ['token' => 't'])->assertUnauthorized();
});

it('revokes an owned token, clears the revocation on re-registration and is idempotent', function () {
    $client = ClientModel::factory()->create();
    $this->actingAs($client, 'client');
    $this->postJson('/api/v1/user/device-token', ['token' => 'owned-token', 'platform_type' => 'android'])->assertOk();

    $this->deleteJson('/api/v1/user/device-token', ['token' => 'owned-token'])->assertOk();
    $this->deleteJson('/api/v1/user/device-token', ['token' => 'owned-token'])->assertOk();
    $this->deleteJson('/api/v1/user/device-token', ['token' => 'never-registered'])->assertOk();
    expect(DeviceTokenModel::query()->where('token', 'owned-token')->firstOrFail()->revoked_at)->not->toBeNull();

    $this->postJson('/api/v1/user/device-token', ['token' => 'owned-token', 'platform_type' => 'android'])->assertOk();
    expect(DeviceTokenModel::query()->where('token', 'owned-token')->firstOrFail()->revoked_at)->toBeNull();
});

it('forbids revoking a token that belongs to another account', function () {
    $owner = ClientModel::factory()->create();
    $this->actingAs($owner, 'client');
    $this->postJson('/api/v1/user/device-token', ['token' => 'private-token', 'platform_type' => 'android'])->assertOk();

    $this->app['auth']->forgetGuards();
    $this->actingAs(ClientModel::factory()->create(), 'client');
    $this->deleteJson('/api/v1/user/device-token', ['token' => 'private-token'])->assertForbidden();

    expect(DeviceTokenModel::query()->where('token', 'private-token')->firstOrFail()->revoked_at)->toBeNull();
});

it('moves a token to the account that registers it next', function () {
    $first = ClientModel::factory()->create();
    $second = ClientModel::factory()->create();
    $this->actingAs($first, 'client');
    $this->postJson('/api/v1/user/device-token', ['token' => 'shared-phone', 'platform_type' => 'android'])->assertOk();

    $this->app['auth']->forgetGuards();
    $this->actingAs($second, 'client');
    $this->postJson('/api/v1/user/device-token', ['token' => 'shared-phone', 'platform_type' => 'android'])->assertOk();

    expect(DeviceTokenModel::query()->where('token', 'shared-phone')->count())->toBe(1)
        ->and(DeviceTokenModel::query()->where('token', 'shared-phone')->value('user_id'))->toBe($second->id);
});

it('stops pushes to the devices of a signed-out client but keeps other sign-ins', function () {
    $client = ClientModel::factory()->create(['email_verified_at' => now()]);
    $phone = $client->createToken('phone')->plainTextToken;
    $tablet = $client->createToken('tablet')->plainTextToken;

    $this->withToken($phone)->postJson('/api/v1/user/device-token', ['token' => 'phone-fcm', 'platform_type' => 'android'])->assertOk();
    $this->app['auth']->forgetGuards();
    $this->withToken($tablet)->postJson('/api/v1/user/device-token', ['token' => 'tablet-fcm', 'platform_type' => 'android'])->assertOk();

    $this->app['auth']->forgetGuards();
    $this->withToken($phone)->postJson('/api/v1/client/logout')->assertSuccessful();

    expect(DeviceTokenModel::query()->where('token', 'phone-fcm')->firstOrFail()->revoked_at)->not->toBeNull()
        ->and(DeviceTokenModel::query()->where('token', 'tablet-fcm')->firstOrFail()->revoked_at)->toBeNull();
});
