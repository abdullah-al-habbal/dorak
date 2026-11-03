<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Mail\SendPasswordResetCode;

const STAFF_OLD_PASSWORD = 'old-password-1';
const STAFF_NEW_PASSWORD = 'new-password-2';

function staffAccount(string $type, array $attributes = []): BarberModel|BranchModel
{
    $attributes += ['password' => bcrypt(STAFF_OLD_PASSWORD)];

    return $type === 'barber'
        ? BarberModel::factory()->create($attributes + ['has_login' => true, 'status' => BarberStatusEnum::Enabled])
        : BranchModel::factory()->create($attributes + ['status' => BranchStatusEnum::Enabled]);
}

function staffGuard(string $type): string
{
    return $type === 'barber' ? 'barber' : 'branch_api';
}

function issuedResetCode(): string
{
    $code = null;
    Mail::assertSent(SendPasswordResetCode::class, function (SendPasswordResetCode $mail) use (&$code): bool {
        $code = $mail->code;

        return true;
    });

    return (string) $code;
}

beforeEach(function (): void {
    Cache::flush();
    Mail::fake();
});

describe('staff password reset', function (): void {
    it('emails a code and resets the password, revoking old tokens', function (string $type): void {
        $account = staffAccount($type);
        $oldToken = $account->createToken('app')->plainTextToken;

        $this->postJson("/api/v1/{$type}/forgot-password", ['email' => $account->email])->assertOk();
        $code = issuedResetCode();

        $this->postJson("/api/v1/{$type}/reset-password", [
            'email' => $account->email,
            'code' => $code,
            'password' => STAFF_NEW_PASSWORD,
            'password_confirmation' => STAFF_NEW_PASSWORD,
        ])->assertOk();

        expect($account->fresh()->tokens()->count())->toBe(0);
        $this->postJson("/api/v1/{$type}/login", ['email' => $account->email, 'password' => STAFF_OLD_PASSWORD])->assertUnauthorized();
        $this->postJson("/api/v1/{$type}/login", ['email' => $account->email, 'password' => STAFF_NEW_PASSWORD])->assertOk();
        expect($oldToken)->toBeString();
    })->with(['barber', 'branch']);

    it('does not reveal unknown emails', function (string $type): void {
        $this->postJson("/api/v1/{$type}/forgot-password", ['email' => 'nobody@example.com'])->assertOk();

        Mail::assertNothingSent();
    })->with(['barber', 'branch']);

    it('rejects a wrong code and an unknown email identically', function (string $type): void {
        $account = staffAccount($type);
        $this->postJson("/api/v1/{$type}/forgot-password", ['email' => $account->email])->assertOk();

        $payload = ['code' => '000000', 'password' => STAFF_NEW_PASSWORD, 'password_confirmation' => STAFF_NEW_PASSWORD];

        $wrong = $this->postJson("/api/v1/{$type}/reset-password", $payload + ['email' => $account->email])->assertUnprocessable();
        $unknown = $this->postJson("/api/v1/{$type}/reset-password", $payload + ['email' => 'nobody@example.com'])->assertUnprocessable();

        expect($wrong->json('errors'))->toBe($unknown->json('errors'));
        $this->postJson("/api/v1/{$type}/login", ['email' => $account->email, 'password' => STAFF_OLD_PASSWORD])->assertOk();
    })->with(['barber', 'branch']);

    it('burns a code after it is used once', function (string $type): void {
        $account = staffAccount($type);
        $this->postJson("/api/v1/{$type}/forgot-password", ['email' => $account->email])->assertOk();
        $code = issuedResetCode();
        $payload = ['email' => $account->email, 'code' => $code, 'password' => STAFF_NEW_PASSWORD, 'password_confirmation' => STAFF_NEW_PASSWORD];

        $this->postJson("/api/v1/{$type}/reset-password", $payload)->assertOk();
        $this->postJson("/api/v1/{$type}/reset-password", $payload)->assertUnprocessable();
    })->with(['barber', 'branch']);

    it('validates password length and confirmation', function (string $type): void {
        $account = staffAccount($type);

        $this->postJson("/api/v1/{$type}/reset-password", [
            'email' => $account->email,
            'code' => '123456',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])->assertUnprocessable();
    })->with(['barber', 'branch']);

    it('never resets a managed barber without a login', function (): void {
        $barber = BarberModel::factory()->create(['has_login' => false, 'password' => null]);

        $this->postJson('/api/v1/barber/forgot-password', ['email' => $barber->email])->assertOk();

        Mail::assertNothingSent();
    });

    it('does not let a barber code reset a branch with the same email', function (): void {
        $barber = staffAccount('barber', ['email' => 'shared@example.com']);
        $branch = staffAccount('branch', ['email' => 'shared@example.com']);
        $this->postJson('/api/v1/barber/forgot-password', ['email' => $barber->email])->assertOk();
        $code = issuedResetCode();

        $this->postJson('/api/v1/branch/reset-password', [
            'email' => $branch->email,
            'code' => $code,
            'password' => STAFF_NEW_PASSWORD,
            'password_confirmation' => STAFF_NEW_PASSWORD,
        ])->assertUnprocessable();
    });
});

describe('staff logout', function (): void {
    it('revokes only the current token', function (string $type): void {
        $account = staffAccount($type);
        $current = $account->createToken('app')->plainTextToken;
        $account->createToken('other');

        $this->withToken($current)->postJson("/api/v1/{$type}/logout")->assertOk();

        expect($account->tokens()->count())->toBe(1);
    })->with(['barber', 'branch']);

    it('requires authentication', function (string $type): void {
        $this->postJson("/api/v1/{$type}/logout")->assertUnauthorized();
    })->with(['barber', 'branch']);

    it('lets a pending barber log out', function (): void {
        $barber = staffAccount('barber', ['status' => BarberStatusEnum::Pending]);
        $token = $barber->createToken('app')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/barber/logout')->assertOk();
    });
});

describe('staff token refresh', function (): void {
    it('swaps the current token for a new working one', function (string $type): void {
        $account = staffAccount($type);
        $old = $account->createToken('app')->plainTextToken;

        $new = $this->withToken($old)->postJson("/api/v1/{$type}/refresh-token")->assertOk()->json('data.token');

        expect($new)->toBeString()->not->toBe($old)
            ->and($account->tokens()->count())->toBe(1);
        $this->app['auth']->forgetGuards();
        $this->withToken($new)->postJson("/api/v1/{$type}/logout")->assertOk();
    })->with(['barber', 'branch']);

    it('refuses a deactivated account', function (string $type): void {
        $account = staffAccount($type);
        $token = $account->createToken('app')->plainTextToken;
        $account->update(['status' => $type === 'barber' ? BarberStatusEnum::Disabled : BranchStatusEnum::Disabled]);

        $this->withToken($token)->postJson("/api/v1/{$type}/refresh-token")->assertForbidden();
    })->with(['barber', 'branch']);

    it('requires authentication', function (string $type): void {
        $this->postJson("/api/v1/{$type}/refresh-token")->assertUnauthorized();
    })->with(['barber', 'branch']);
});
