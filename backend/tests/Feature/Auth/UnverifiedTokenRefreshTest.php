<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Mail;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;

it('refreshes the token of a newly registered unverified client', function (): void {
    Mail::fake();

    $token = $this->postJson('/api/v1/client/register', [
        'name' => 'New Client',
        'email' => 'fresh@example.com',
        'password' => 'secret-pass-1',
        'password_confirmation' => 'secret-pass-1',
    ])->assertSuccessful()->json('data.token');

    $response = $this->withToken($token)->postJson('/api/v1/client/refresh-token')
        ->assertOk()
        ->assertJsonStructure(['data' => ['token']]);

    $fresh = $response->json('data.token');
    expect($fresh)->toBeString()->not->toBe($token);

    $client = ClientModel::query()->where('email', 'fresh@example.com')->firstOrFail();
    expect($client->tokens()->count())->toBe(1);
    expect($client->tokens()->firstOrFail()->abilities)->toBe(['email-verification']);

    $this->app['auth']->forgetGuards();
    $this->withToken($fresh)->getJson('/api/v1/client/profile')
        ->assertOk()
        ->assertJsonPath('data.email_verified_at', null);
});

it('refreshes the token of a client whose email change reset verification', function (): void {
    Mail::fake();
    $client = ClientModel::factory()->create();
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $this->withToken($token)->patchJson('/api/v1/client/profile', ['email' => 'changed@example.com', 'current_password' => 'password'])->assertOk();
    $this->app['auth']->forgetGuards();

    $response = $this->withToken($token)->postJson('/api/v1/client/refresh-token')
        ->assertOk()
        ->assertJsonStructure(['data' => ['token']]);

    expect($client->fresh()->email_verified_at)->toBeNull();
    expect($client->tokens()->firstOrFail()->abilities)->toBe(['email-verification']);

    $this->app['auth']->forgetGuards();
    $this->withToken($response->json('data.token'))->getJson('/api/v1/client/profile')
        ->assertOk()
        ->assertJsonPath('data.email', 'changed@example.com');
});

it('still keeps sensitive endpoints closed to the refreshed unverified token', function (): void {
    $client = ClientModel::factory()->unverified()->create();
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $fresh = $this->withToken($token)->postJson('/api/v1/client/refresh-token')->assertOk()->json('data.token');
    $this->app['auth']->forgetGuards();

    $this->withToken($fresh)->getJson('/api/v1/bookings')->assertForbidden();
    $this->app['auth']->forgetGuards();
    $this->withToken($fresh)->patchJson('/api/v1/client/profile', ['name' => 'X'])
        ->assertForbidden()
        ->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
});

it('keeps refresh closed to disabled clients', function (): void {
    $client = ClientModel::factory()->create(['status' => ClientStatusEnum::Disabled]);
    $token = $client->createToken('client-app')->plainTextToken;

    $this->withToken($token)->postJson('/api/v1/client/refresh-token')
        ->assertForbidden()
        ->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
});
