<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;

/** T11.3: a stranger must not learn whether an email has an account from login or password reset. */
dataset('accounts', [
    'client' => [fn () => ClientModel::factory()->create(['password' => Hash::make('password123')]), '/api/v1/client'],
    'barber' => [fn () => BarberModel::factory()->create(['password' => Hash::make('password123')]), '/api/v1/barber'],
    'branch' => [fn () => BranchModel::factory()->create(['password' => Hash::make('password123')]), '/api/v1/branch'],
]);

function comparable($response): array
{
    return [$response->status(), $response->json('message'), $response->json('code'), $response->json('errors')];
}

it('answers a password-reset request the same for a known and an unknown email', function (Closure $make, string $prefix) {
    Mail::fake();
    $account = $make();

    $known = $this->postJson("{$prefix}/forgot-password", ['email' => $account->email]);
    $unknown = $this->postJson("{$prefix}/forgot-password", ['email' => 'nobody@example.com']);

    expect(comparable($known))->toBe(comparable($unknown));
})->with('accounts');

it('refuses a wrong password and an unknown email with the same answer', function (Closure $make, string $prefix) {
    $account = $make();

    $wrongPassword = $this->postJson("{$prefix}/login", ['email' => $account->email, 'password' => 'not-the-password']);
    $unknown = $this->postJson("{$prefix}/login", ['email' => 'nobody@example.com', 'password' => 'not-the-password']);

    expect(comparable($wrongPassword))->toBe(comparable($unknown));
})->with('accounts');

it('refuses a reset with a wrong code and an unknown email the same way', function (Closure $make, string $prefix) {
    $account = $make();
    $payload = ['code' => '000000', 'password' => 'new-password-1', 'password_confirmation' => 'new-password-1'];

    $wrongCode = $this->postJson("{$prefix}/reset-password", ['email' => $account->email] + $payload);
    $unknown = $this->postJson("{$prefix}/reset-password", ['email' => 'nobody@example.com'] + $payload);

    expect(comparable($wrongCode))->toBe(comparable($unknown));
})->with('accounts');

it('checks a client reset code without revealing whether the email exists', function () {
    $client = ClientModel::factory()->create();

    $wrongCode = $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '000000']);
    $unknown = $this->postJson('/api/v1/client/forgot-password/verify', ['email' => 'nobody@example.com', 'code' => '000000']);

    expect(comparable($wrongCode))->toBe(comparable($unknown));
});
