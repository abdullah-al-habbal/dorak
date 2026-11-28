<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialUser;
use Modules\Client\Enums\UniverseEnum;
use Modules\Client\Mail\SendEmailVerificationCode;
use Modules\Client\Models\ClientModel;
use Tests\Support\Constants\ClientPayloadTestConstants;

function clientPayloadKeys(): array
{
    return ClientPayloadTestConstants::CLIENT_PAYLOAD_TEST_KEYS;
}

it('returns the same 9-key client object from login, register, social login and profile', function (): void {
    Mail::fake();
    $client = ClientModel::factory()->create(['password' => 'secret-pass-1']);

    $login = $this->postJson('/api/v1/client/login', [
        'email' => $client->email,
        'password' => 'secret-pass-1',
    ])->assertOk()->assertJsonStructure(['data' => ['token', 'client' => clientPayloadKeys()]]);

    $register = $this->postJson('/api/v1/client/register', [
        'name' => 'New Client',
        'email' => 'new-client@example.com',
        'password' => 'secret-pass-1',
        'password_confirmation' => 'secret-pass-1',
    ])->assertSuccessful()->assertJsonStructure(['data' => ['token', 'client' => clientPayloadKeys()]]);

    $social = SocialUser::class;
    $user = (new $social)->map(['id' => 'g-1', 'name' => 'Social Person', 'email' => 'social@example.com', 'avatar' => null])->setRaw(['email_verified' => true]);
    $stateless = Mockery::mock();
    $stateless->shouldReceive('userFromToken')->andReturn($user);
    $driver = Mockery::mock();
    $driver->shouldReceive('stateless')->andReturn($stateless);
    Socialite::shouldReceive('driver')->with('google')->andReturn($driver);
    $socialResponse = $this->postJson('/api/v1/client/social/google', ['access_token' => 'social-access-token'])
        ->assertSuccessful()
        ->assertJsonStructure(['data' => ['token', 'client' => clientPayloadKeys()]]);

    $this->withToken($login->json('data.token'))->getJson('/api/v1/client/profile')
        ->assertOk()
        ->assertJsonStructure(['data' => clientPayloadKeys()])
        ->assertJsonCount(9, 'data')
        ->assertJsonPath('data.preferred_universe', 'men');

    expect($register->json('data.client'))->toHaveKeys(clientPayloadKeys())->toHaveCount(9);
    expect($register->json('data.client.preferred_universe'))->toBe(UniverseEnum::Men->value);
    expect($register->json('data.client.created_at'))->not->toBeNull();
    expect($socialResponse->json('data.client'))->toHaveCount(9);
    expect($login->json('data.client'))->toHaveCount(9);
});

it('exposes the avatar as a public url', function (): void {
    $client = ClientModel::factory()->create(['avatar_path' => 'avatars/me.jpg']);
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $avatar = $this->withToken($token)->getJson('/api/v1/client/profile')->assertOk()->json('data.avatar_url');

    expect($avatar)->toEndWith('avatars/me.jpg');
});

describe('PATCH /api/v1/client/profile email change', function (): void {
    it('clears email_verified_at and sends a new verification mail', function (): void {
        Mail::fake();
        $client = ClientModel::factory()->create();
        $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

        $response = $this->withToken($token)->patchJson('/api/v1/client/profile', ['email' => 'changed@example.com', 'current_password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['data' => clientPayloadKeys()])
            ->assertJsonPath('data.email', 'changed@example.com')
            ->assertJsonPath('data.email_verified_at', null);

        expect($client->fresh()->email_verified_at)->toBeNull();
        Mail::assertSent(SendEmailVerificationCode::class, fn ($mail) => $mail->hasTo('changed@example.com'));
        expect(Cache::get("email_verify_{$client->id}"))->not->toBeNull();
        expect($response->json('data.id'))->toBe($client->id);
    });

    it('lets the client confirm the new address with the emailed code', function (): void {
        Mail::fake();
        $client = ClientModel::factory()->create();
        $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

        $this->withToken($token)->patchJson('/api/v1/client/profile', ['email' => 'changed@example.com', 'current_password' => 'password'])->assertOk();
        $this->app['auth']->forgetGuards();

        $this->withToken($token)->postJson('/api/v1/client/email/verify', [
            'code' => Mail::sent(SendEmailVerificationCode::class)->last()->code,
        ])->assertOk();

        expect($client->fresh()->email_verified_at)->not->toBeNull();
    });

    it('leaves email_verified_at unchanged when the email is the same', function (): void {
        Mail::fake();
        $client = ClientModel::factory()->create();
        $verifiedAt = $client->email_verified_at;
        $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

        $this->withToken($token)->patchJson('/api/v1/client/profile', ['email' => $client->email, 'name' => 'Renamed'])
            ->assertOk();

        expect($client->fresh()->email_verified_at?->equalTo($verifiedAt))->toBeTrue();
        Mail::assertNothingSent();
    });

    it('leaves email_verified_at unchanged when only the name changes', function (): void {
        Mail::fake();
        $client = ClientModel::factory()->create();
        $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

        $this->withToken($token)->patchJson('/api/v1/client/profile', ['name' => 'Renamed'])->assertOk();

        expect($client->fresh()->email_verified_at)->not->toBeNull();
        Mail::assertNothingSent();
    });
});
