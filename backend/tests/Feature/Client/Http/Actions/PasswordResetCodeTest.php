<?php

declare(strict_types=1);

use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Modules\Client\Constants\ClientPasswordResetConstants;
use Modules\Client\Models\ClientModel;
use Modules\Client\Services\PasswordResetCodeVerifier;
use Modules\Core\Services\TranslatorHandlerService;

beforeEach(function (): void {
    // The attempt budget is the behaviour under test; the per-IP route
    // throttle is covered by MobileAuthRateLimitTest.
    $this->withoutMiddleware(ThrottleRequests::class);
    Mail::fake();
});

function issueResetCode(ClientModel $client, string $code = '123456'): void
{
    app(PasswordResetCodeVerifier::class)->issue((string) $client->id, $code);
}

function invalidResetCodeMessage(): string
{
    return app(TranslatorHandlerService::class)->translate('core::messages.invalid_reset_code');
}

function resetWithCode(ClientModel $client, string $code): array
{
    return [
        'email' => $client->email,
        'code' => $code,
        'password' => 'NewPassword123',
        'password_confirmation' => 'NewPassword123',
    ];
}

describe('POST /api/v1/client/forgot-password/verify', function (): void {
    it('accepts the issued code without consuming it', function (): void {
        $client = ClientModel::factory()->create();
        issueResetCode($client);

        $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '123456'])
            ->assertOk()
            ->assertJsonPath('success', true);

        expect(Cache::get("password_reset_{$client->id}"))->toBe('123456');

        $this->postJson('/api/v1/client/reset-password', resetWithCode($client, '123456'))->assertOk();

        expect(Hash::check('NewPassword123', $client->fresh()->password))->toBeTrue()
            ->and(Cache::get("password_reset_{$client->id}"))->toBeNull();
    });

    it('rejects a wrong code with a code field error', function (): void {
        $client = ClientModel::factory()->create();
        issueResetCode($client);

        $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '000000'])
            ->assertStatus(422)
            ->assertJsonPath('code', 'VALIDATION_FAILED')
            ->assertJsonPath('message', invalidResetCodeMessage())
            ->assertJsonPath('errors.code.0', invalidResetCodeMessage());
    });

    it('rejects an unknown email exactly like a wrong code', function (): void {
        $client = ClientModel::factory()->create();
        issueResetCode($client);

        $wrongCode = $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '000000']);
        $unknownEmail = $this->postJson('/api/v1/client/forgot-password/verify', ['email' => 'nobody@example.com', 'code' => '123456']);

        $unknownEmail->assertStatus(422);
        expect($unknownEmail->json('code'))->toBe($wrongCode->json('code'))
            ->and($unknownEmail->json('message'))->toBe($wrongCode->json('message'))
            ->and($unknownEmail->json('errors'))->toBe($wrongCode->json('errors'));
    });

    it('rejects an expired or never-issued code', function (): void {
        $client = ClientModel::factory()->create();

        $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '123456'])
            ->assertStatus(422);
    });

    it('validates the payload shape', function (): void {
        $this->postJson('/api/v1/client/forgot-password/verify', ['email' => 'not-an-email', 'code' => '12'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'code']);
    });
});

describe('shared reset-code attempt budget', function (): void {
    it('invalidates the code after five wrong verify attempts', function (): void {
        $client = ClientModel::factory()->create();
        issueResetCode($client);

        foreach (range(1, ClientPasswordResetConstants::CLIENT_PASSWORD_RESET_MAX_ATTEMPTS) as $_) {
            $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '000000'])
                ->assertStatus(422);
        }

        $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '123456'])
            ->assertStatus(422);
        $this->postJson('/api/v1/client/reset-password', resetWithCode($client, '123456'))
            ->assertStatus(422);

        expect(Hash::check('NewPassword123', $client->fresh()->password))->toBeFalse();
    });

    it('counts wrong guesses on verify and reset against one budget', function (): void {
        $client = ClientModel::factory()->create();
        issueResetCode($client);

        foreach (range(1, 3) as $_) {
            $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '000000'])
                ->assertStatus(422);
        }
        foreach (range(1, 2) as $_) {
            $this->postJson('/api/v1/client/reset-password', resetWithCode($client, '000000'))
                ->assertStatus(422)
                ->assertJsonPath('errors.code.0', invalidResetCodeMessage());
        }

        $this->postJson('/api/v1/client/reset-password', resetWithCode($client, '123456'))
            ->assertStatus(422);
    });

    it('keeps the code alive below the limit', function (): void {
        $client = ClientModel::factory()->create();
        issueResetCode($client);

        foreach (range(1, ClientPasswordResetConstants::CLIENT_PASSWORD_RESET_MAX_ATTEMPTS - 1) as $_) {
            $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '000000'])
                ->assertStatus(422);
        }

        $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '123456'])
            ->assertOk();
    });

    it('a newly requested code starts a fresh budget', function (): void {
        $client = ClientModel::factory()->create();
        issueResetCode($client);

        foreach (range(1, ClientPasswordResetConstants::CLIENT_PASSWORD_RESET_MAX_ATTEMPTS - 1) as $_) {
            $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => '000000'])
                ->assertStatus(422);
        }

        $this->postJson('/api/v1/client/forgot-password', ['email' => $client->email])->assertOk();
        $code = Cache::get("password_reset_{$client->id}");

        $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => $code === '000000' ? '111111' : '000000'])
            ->assertStatus(422);
        $this->postJson('/api/v1/client/forgot-password/verify', ['email' => $client->email, 'code' => $code])
            ->assertOk();
    });
});
