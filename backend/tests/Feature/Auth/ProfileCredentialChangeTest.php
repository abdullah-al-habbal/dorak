<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Hash;
use Modules\Barber\Models\BarberModel;
use Modules\Client\Models\ClientModel;
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
