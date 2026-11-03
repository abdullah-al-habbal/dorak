<?php

declare(strict_types=1);

use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;
use Modules\Client\Models\SocialAccountModel;

beforeEach(function () {
    $this->user = new User;
    $this->user->id = 'google-uid-123';
    $this->user->name = 'Test User';
    $this->user->email = 'social@example.com';
    $this->user->avatar = 'https://example.com/avatar.jpg';
    $this->user->setRaw(['email_verified' => true]);
});

it('returns 422 without access_token', function () {
    $response = $this->postJson('/api/v1/client/social/google', []);

    $response->assertStatus(422);
});

it('returns 422 with empty access_token', function () {
    $response = $this->postJson('/api/v1/client/social/google', [
        'access_token' => '',
    ]);

    $response->assertStatus(422);
});

it('returns 401 with invalid access_token', function () {
    Socialite::shouldReceive('driver')->with('google')->andThrow(new Exception('Invalid token'));

    $response = $this->postJson('/api/v1/client/social/google', [
        'access_token' => 'invalid-token-value',
    ]);

    $response->assertStatus(401);
});

it('creates new client via social login', function () {
    $stateless = Mockery::mock();
    $stateless->shouldReceive('userFromToken')->with('valid-google-token')->andReturn($this->user);

    $driver = Mockery::mock();
    $driver->shouldReceive('stateless')->andReturn($stateless);

    Socialite::shouldReceive('driver')->with('google')->andReturn($driver);

    $response = $this->postJson('/api/v1/client/social/google', [
        'access_token' => 'valid-google-token',
    ]);

    $response->assertStatus(200);
    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
    expect($response->json('data.client.email'))->toBe('social@example.com');
    expect($response->json('data.client.name'))->toBe('Test User');

    $this->assertDatabaseHas('clients', ['email' => 'social@example.com']);
    $this->assertDatabaseHas('social_accounts', [
        'provider' => 'google',
        'provider_id' => 'google-uid-123',
    ]);
});

it('issues a verification-only token to a pending client on social login', function () {
    $client = ClientModel::factory()->create([
        'email' => 'pending-social@example.com',
        'status' => ClientStatusEnum::Pending,
        'email_verified_at' => null,
    ]);
    SocialAccountModel::factory()->create([
        'client_id' => $client->id,
        'provider' => 'google',
        'provider_id' => 'google-uid-123',
    ]);

    $stateless = Mockery::mock();
    $stateless->shouldReceive('userFromToken')->with('pending-social-token')->andReturn($this->user);
    $driver = Mockery::mock();
    $driver->shouldReceive('stateless')->andReturn($stateless);
    Socialite::shouldReceive('driver')->with('google')->andReturn($driver);

    $response = $this->postJson('/api/v1/client/social/google', [
        'access_token' => 'pending-social-token',
    ])->assertOk()->assertJsonPath('data.client.email_verified_at', null);

    expect($client->tokens()->firstOrFail()->abilities)->toBe(['email-verification']);
    $this->withToken($response->json('data.token'))->getJson('/api/v1/bookings')->assertForbidden();
});

it('returns existing client when social account already linked', function () {
    $client = ClientModel::factory()->create(['email' => 'existing@example.com']);
    SocialAccountModel::factory()->create([
        'client_id' => $client->id,
        'provider' => 'google',
        'provider_id' => 'google-existing-uid',
    ]);

    $user = new User;
    $user->id = 'google-existing-uid';
    $user->name = 'Existing User';
    $user->email = 'existing@example.com';
    $user->avatar = null;

    $stateless = Mockery::mock();
    $stateless->shouldReceive('userFromToken')->with('existing-token')->andReturn($user);

    $driver = Mockery::mock();
    $driver->shouldReceive('stateless')->andReturn($stateless);

    Socialite::shouldReceive('driver')->with('google')->andReturn($driver);

    $response = $this->postJson('/api/v1/client/social/google', [
        'access_token' => 'existing-token',
    ]);

    $response->assertStatus(200);
    expect($response->json('data.client.id'))->toBe($client->id);
    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
});

it('links social account to existing client by email', function () {
    $client = ClientModel::factory()->create(['email' => 'linked@example.com']);

    $user = new User;
    $user->id = 'google-new-link-uid';
    $user->name = 'Link User';
    $user->email = 'linked@example.com';
    $user->avatar = null;
    $user->setRaw(['email_verified' => true]);

    $stateless = Mockery::mock();
    $stateless->shouldReceive('userFromToken')->with('link-token')->andReturn($user);

    $driver = Mockery::mock();
    $driver->shouldReceive('stateless')->andReturn($stateless);

    Socialite::shouldReceive('driver')->with('google')->andReturn($driver);

    $response = $this->postJson('/api/v1/client/social/google', [
        'access_token' => 'link-token',
    ]);

    $response->assertStatus(200);
    expect($response->json('data.client.id'))->toBe($client->id);
    expect($client->socialAccounts()->count())->toBe(1);
});

function mockSocialUser(string $token, User $user): void
{
    $stateless = Mockery::mock();
    $stateless->shouldReceive('userFromToken')->with($token)->andReturn($user);

    $driver = Mockery::mock();
    $driver->shouldReceive('stateless')->andReturn($stateless);

    Socialite::shouldReceive('driver')->with('google')->andReturn($driver);
}

it('refuses to link an existing client when the provider does not verify the email', function (mixed $raw) {
    $client = ClientModel::factory()->create(['email' => 'victim@example.com']);

    $user = new User;
    $user->id = 'attacker-uid';
    $user->name = 'Attacker';
    $user->email = 'victim@example.com';
    $user->setRaw($raw);
    mockSocialUser('unverified-token', $user);

    $this->postJson('/api/v1/client/social/google', ['access_token' => 'unverified-token'])
        ->assertForbidden()
        ->assertJsonPath('code', 'SOCIAL_EMAIL_NOT_VERIFIED');

    expect($client->socialAccounts()->count())->toBe(0);
    $this->assertDatabaseMissing('social_accounts', ['provider_id' => 'attacker-uid']);
})->with([
    'flag false' => [['email_verified' => false]],
    'flag string false' => [['email_verified' => 'false']],
    'google v2 flag false' => [['verified_email' => false]],
    'flag missing' => [[]],
]);

it('does not create a client from an unverified email', function () {
    $user = new User;
    $user->id = 'fresh-uid';
    $user->name = 'Fresh';
    $user->email = 'fresh@example.com';
    $user->setRaw(['email_verified' => false]);
    mockSocialUser('fresh-token', $user);

    $this->postJson('/api/v1/client/social/google', ['access_token' => 'fresh-token'])->assertForbidden();

    $this->assertDatabaseMissing('clients', ['email' => 'fresh@example.com']);
});

it('links when the provider verifies the email via Google verified_email or a string flag', function (array $raw) {
    $client = ClientModel::factory()->create(['email' => 'ok@example.com']);

    $user = new User;
    $user->id = 'ok-uid';
    $user->name = 'Ok';
    $user->email = 'ok@example.com';
    $user->setRaw($raw);
    mockSocialUser('verified-ok-token', $user);

    $this->postJson('/api/v1/client/social/google', ['access_token' => 'verified-ok-token'])
        ->assertOk()
        ->assertJsonPath('data.client.id', $client->id);
})->with([
    'google v2' => [['verified_email' => true]],
    'string true' => [['email_verified' => 'true']],
]);

it('lets an already linked provider account sign in without re-checking email verification', function () {
    $client = ClientModel::factory()->create(['email' => 'linked-old@example.com']);
    SocialAccountModel::factory()->create(['client_id' => $client->id, 'provider' => 'google', 'provider_id' => 'known-uid']);

    $user = new User;
    $user->id = 'known-uid';
    $user->name = 'Known';
    $user->email = 'linked-old@example.com';
    mockSocialUser('known-token', $user);

    $this->postJson('/api/v1/client/social/google', ['access_token' => 'known-token'])->assertOk();
});
