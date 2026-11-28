<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Modules\Barber\Models\BarberModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Constants\ProfileCredentialConstants;
use Modules\Core\Enums\TokenAbility;

const PROFILE_CREDENTIAL_PASSWORD = 'the-current-password-123';

/** A signed-in client or barber, with the API token it uses and a second one from another device. */
function profileCredentialAccount(string $guard): array
{
    $attributes = ['password' => Hash::make(PROFILE_CREDENTIAL_PASSWORD)];
    $account = $guard === 'barber' ? BarberModel::factory()->create($attributes) : ClientModel::factory()->create($attributes);
    $abilities = $account instanceof BarberModel ? TokenAbility::forBarberApp() : $account->accessTokenAbilities();
    $token = $account->createToken('this-device', $abilities)->plainTextToken;
    $account->createToken('other-device', $abilities);

    return [$account, $token];
}

/** BG-61: the profile routes never set a password. */
describe('Password in a profile update', function (): void {
    it('is refused, and changes nothing', function (string $guard, mixed $password): void {
        [$account, $token] = profileCredentialAccount($guard);
        $hash = $account->fresh()->password;

        $this->withToken($token)->patchJson("/api/v1/{$guard}/profile", [
            'password' => $password,
            'password_confirmation' => $password,
            'universe' => 'women',
        ])->assertUnprocessable()->assertJsonValidationErrors(['password'], 'errors');

        expect($account->fresh()->password)->toBe($hash)
            ->and($account->tokens()->count())->toBe(2);
    })->with(['client', 'barber'], ['a new password' => 'a-new-password-456', 'empty' => '', 'null' => null]);
});

/** BG-62: the email is where password recovery goes, so changing it needs the current password. */
describe('Email change in a profile update', function (): void {
    beforeEach(fn () => Mail::fake());

    it('is refused without the current password or with a wrong one', function (string $guard, array $extra): void {
        [$account, $token] = profileCredentialAccount($guard);
        $email = $account->email;

        $this->withToken($token)->patchJson("/api/v1/{$guard}/profile", ['email' => 'moved@example.test', ...$extra])
            ->assertUnprocessable()->assertJsonValidationErrors(['current_password'], 'errors');

        expect($account->fresh()->email)->toBe($email)
            ->and($account->fresh()->email_verified_at?->toIso8601String())->toBe($account->email_verified_at?->toIso8601String());
        Mail::assertNothingSent();
    })->with(['client', 'barber'], ['missing' => [[]], 'empty' => [['current_password' => '']], 'wrong' => [['current_password' => 'not-it-123456']]]);

    it('goes through with the current password', function (string $guard): void {
        [$account, $token] = profileCredentialAccount($guard);

        $this->withToken($token)->patchJson("/api/v1/{$guard}/profile", [
            'email' => 'moved@example.test',
            'current_password' => PROFILE_CREDENTIAL_PASSWORD,
        ])->assertOk()->assertJsonPath('data.email', 'moved@example.test');

        expect($account->fresh()->email)->toBe('moved@example.test');
    })->with(['client', 'barber']);

    it('needs no password when the address stays the same, or is not sent', function (string $guard): void {
        [$account, $token] = profileCredentialAccount($guard);

        $this->withToken($token)->patchJson("/api/v1/{$guard}/profile", ['email' => strtoupper($account->email), 'universe' => 'women'])->assertOk();
        $this->withToken($token)->patchJson("/api/v1/{$guard}/profile", ['universe' => 'men'])->assertOk();
    })->with(['client', 'barber']);

    it('stops password guessing after the per-account limit, without blocking other edits or accounts', function (string $guard): void {
        [, $token] = profileCredentialAccount($guard);
        [, $otherToken] = profileCredentialAccount($guard);
        $guess = ['email' => 'moved@example.test', 'current_password' => 'not-it-123456'];

        foreach (range(1, ProfileCredentialConstants::PROFILE_EMAIL_CHANGE_PER_MINUTE) as $attempt) {
            $this->withToken($token)->patchJson("/api/v1/{$guard}/profile", $guess)->assertUnprocessable();
        }
        $this->withToken($token)->patchJson("/api/v1/{$guard}/profile", $guess)->assertTooManyRequests();
        $this->withToken($token)->patchJson("/api/v1/{$guard}/profile", ['universe' => 'women'])->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($otherToken)->patchJson("/api/v1/{$guard}/profile", $guess)->assertUnprocessable();
    })->with(['client', 'barber']);
});
