<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;

it('returns the authenticated client profile', function (): void {
    $client = ClientModel::factory()->create(['phone' => '+963911111111']);
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/client/profile')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.id', $client->id)
        ->assertJsonPath('data.name', $client->name)
        ->assertJsonPath('data.email', $client->email)
        ->assertJsonPath('data.phone', '+963911111111')
        ->assertJsonPath('data.email_verified', true);
});

it('returns the same client payload as login', function (): void {
    $client = ClientModel::factory()->create(['password' => 'secret-pass-1']);

    $login = $this->postJson('/api/v1/client/login', [
        'email' => $client->email,
        'password' => 'secret-pass-1',
    ])->assertOk();

    $this->withToken($login->json('data.token'))->getJson('/api/v1/client/profile')
        ->assertOk()
        ->assertJsonPath('data', $login->json('data.client'));
});

it('only exposes the caller own profile', function (): void {
    $client = ClientModel::factory()->create();
    $other = ClientModel::factory()->create();
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/client/profile')
        ->assertOk()
        ->assertJsonPath('data.id', $client->id)
        ->assertJsonMissingPath('data.password')
        ->assertJsonMissing(['email' => $other->email]);
});

it('rejects a request without a token', function (): void {
    $this->getJson('/api/v1/client/profile')->assertUnauthorized();
});

it('rejects barber and branch tokens', function (): void {
    $barberToken = BarberModel::factory()->create()->createToken('test')->plainTextToken;
    $branchToken = BranchModel::factory()->create()->createToken('test')->plainTextToken;

    $this->withToken($barberToken)->getJson('/api/v1/client/profile')->assertUnauthorized();
    $this->app['auth']->forgetGuards();
    $this->withToken($branchToken)->getJson('/api/v1/client/profile')->assertUnauthorized();
});

it('blocks clients whose account is not active', function (): void {
    $client = ClientModel::factory()->create(['status' => ClientStatusEnum::Disabled]);
    $token = $client->createToken('client-app')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/client/profile')
        ->assertForbidden()
        ->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
});
