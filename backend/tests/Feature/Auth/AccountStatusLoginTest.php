<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;

it('rejects disabled clients before issuing tokens', function (): void {
    $client = ClientModel::factory()->create(['status' => 'disabled']);

    $this->postJson('/api/v1/client/login', [
        'email' => $client->email,
        'password' => 'password',
    ])->assertForbidden()->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');

    expect($client->tokens()->count())->toBe(0);
});

it('issues a verification-only login token to pending clients', function (): void {
    $client = ClientModel::factory()->create(['status' => 'pending', 'email_verified_at' => null]);
    Mail::fake();

    $response = $this->postJson('/api/v1/client/login', [
        'email' => $client->email,
        'password' => 'password',
    ])->assertOk()->assertJsonPath('data.client.email_verified_at', null);

    $token = $client->tokens()->firstOrFail();
    expect($token->abilities)->toBe(['email-verification']);

    $this->withToken($response->json('data.token'))
        ->postJson('/api/v1/client/email/verify/send')
        ->assertOk();
    $this->withToken($response->json('data.token'))
        ->postJson('/api/v1/user/device-token', ['token' => 'pending-device', 'platform' => 'ios'])
        ->assertForbidden()
        ->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
    $this->withToken($response->json('data.token'))
        ->getJson('/api/v1/bookings')
        ->assertForbidden();
});

it('activates a pending client after email verification', function (): void {
    $client = ClientModel::factory()->create(['status' => 'pending', 'email_verified_at' => null]);
    $token = $client->createToken('verify', ['email-verification'])->plainTextToken;
    Cache::put("email_verify_{$client->id}", '123456', now()->addMinutes(10));

    $this->withToken($token)->postJson('/api/v1/client/email/verify', ['code' => '123456'])->assertOk();

    expect($client->fresh()->status->value)->toBe('enabled')
        ->and($client->fresh()->email_verified_at)->not->toBeNull();

    expect($client->tokens()->firstOrFail()->abilities)->toBe(['client-active']);
    Auth::forgetGuards();
    $this->withToken($token)->getJson('/api/v1/bookings')->assertOk();
});

it('rejects inactive barbers and branches before issuing tokens', function (string $actor, string $path, string $status): void {
    $account = $actor === 'barber'
        ? BarberModel::factory()->create(['status' => $status, 'has_login' => true])
        : BranchModel::factory()->create(['status' => $status]);

    $this->postJson($path, [
        'email' => $account->email,
        'password' => 'password',
    ])->assertForbidden()->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');

    expect($account->tokens()->count())->toBe(0);
})->with([
    'disabled barber' => ['barber', '/api/v1/barber/login', 'disabled'],
    'pending barber' => ['barber', '/api/v1/barber/login', 'pending'],
    'pending branch' => ['branch', '/api/v1/branch/login', 'pending'],
    'disabled branch' => ['branch', '/api/v1/branch/login', 'disabled'],
]);
