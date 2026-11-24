<?php

declare(strict_types=1);

use Modules\Ban\Models\BanModel;
use Modules\Barber\Models\BarberModel;
use Modules\Client\CQRS\Command\Client\ChangePasswordCommand;
use Modules\Client\Models\ClientModel;
use Modules\Client\Repositories\ChangePasswordEloquentResolver;
use Modules\Client\Services\ClientAccountDeletion;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Models\DeviceTokenModel;
use Modules\Core\Services\DeviceTokenService;

function lifecycleDeviceToken(ClientModel|BarberModel $owner, string $token, int|string|null $accessTokenId = null): DeviceTokenModel
{
    return DeviceTokenModel::query()->create([
        'user_id' => $owner->getKey(),
        'user_type' => DeviceTokenUserTypeEnum::from($owner->getMorphClass()),
        'token' => $token,
        'platform_type' => 'android',
        'access_token_id' => $accessTokenId,
        'last_used_at' => now(),
    ]);
}

it('erases every device token when a client account is deleted, and only theirs', function () {
    $client = ClientModel::factory()->create();
    $other = ClientModel::factory()->create();
    lifecycleDeviceToken($client, 'client-a');
    lifecycleDeviceToken($client, 'client-b');
    lifecycleDeviceToken($other, 'other-client');

    expect(app(ClientAccountDeletion::class)->delete($client))->toBeTrue();

    expect(DeviceTokenModel::query()->where('user_id', $client->getKey())->where('user_type', $client->getMorphClass())->count())->toBe(0)
        ->and(DeviceTokenModel::query()->where('token', 'other-client')->whereNull('revoked_at')->exists())->toBeTrue();
});

it('revokes the device tokens of a client when the password changes', function () {
    $client = ClientModel::factory()->create();
    $token = lifecycleDeviceToken($client, 'client-pw');
    $untouched = lifecycleDeviceToken(ClientModel::factory()->create(), 'other-pw');

    app(ChangePasswordEloquentResolver::class)->execute(new ChangePasswordCommand((string) $client->getKey(), 'NewPassw0rd!'));

    expect($token->fresh()->revoked_at)->not->toBeNull()
        ->and($untouched->fresh()->revoked_at)->toBeNull();
});

it('revokes all device tokens of an account but keeps the kept sign-in', function () {
    $client = ClientModel::factory()->create();
    $service = app(DeviceTokenService::class);
    $kept = lifecycleDeviceToken($client, 'kept', 7);
    $other = lifecycleDeviceToken($client, 'other', 8);

    $service->revokeAllForAccount($client, 7);

    expect($kept->fresh()->revoked_at)->toBeNull()->and($other->fresh()->revoked_at)->not->toBeNull();

    $service->revokeAllForAccount($client);

    expect($kept->fresh()->revoked_at)->not->toBeNull();
});

it('keeps browser tokens when a sign-in is kept, and revokes them when none is', function () {
    $client = ClientModel::factory()->create();
    $service = app(DeviceTokenService::class);
    $browser = lifecycleDeviceToken($client, 'browser');
    $browser->forceFill(['platform_type' => 'web'])->save();
    $phone = lifecycleDeviceToken($client, 'phone', 8);

    $service->revokeAllForAccount($client, 7);

    expect($browser->fresh()->revoked_at)->toBeNull()->and($phone->fresh()->revoked_at)->not->toBeNull();

    $service->revokeAllForAccount($client);

    expect($browser->fresh()->revoked_at)->not->toBeNull();
});

it('revokes the device tokens of a banned barber', function () {
    $barber = BarberModel::factory()->create();
    $token = lifecycleDeviceToken($barber, 'barber-ban');

    BanModel::query()->create([
        'bannable_type' => $barber->getMorphClass(),
        'bannable_id' => $barber->getKey(),
        'banned_at' => now()->subMinute(),
        'expires_at' => null,
        'reason' => 'test',
    ]);

    expect($token->fresh()->revoked_at)->not->toBeNull();
});
