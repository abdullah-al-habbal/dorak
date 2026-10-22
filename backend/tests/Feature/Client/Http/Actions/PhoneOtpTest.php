<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Modules\Client\Models\ClientModel;
use Modules\Core\Contracts\SmsSender;

final class RecordingSmsSender implements SmsSender
{
    /** @var list<array{phone: string, message: string}> */
    public array $sent = [];

    public function send(string $phone, string $message): void
    {
        $this->sent[] = ['phone' => $phone, 'message' => $message];
    }
}

function phoneOtpSender(): RecordingSmsSender
{
    $sender = new RecordingSmsSender;
    app()->instance(SmsSender::class, $sender);

    return $sender;
}

function phoneOtpToken(ClientModel $client): string
{
    return $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;
}

function seedPhoneOtp(ClientModel $client, string $phone, string $code = '123456'): void
{
    Cache::put("phone_otp_{$client->id}", ['phone' => $phone, 'code_hash' => Hash::make($code)], now()->addMinutes(10));
}

describe('POST /api/v1/client/phone/otp', function (): void {
    it('sends exactly one sms and caches only a hashed code', function (): void {
        $sender = phoneOtpSender();
        $client = ClientModel::factory()->create();

        $this->withToken(phoneOtpToken($client))
            ->postJson('/api/v1/client/phone/otp', ['phone' => '0911 222 333'])
            ->assertOk()
            ->assertJsonPath('success', true);

        expect($sender->sent)->toHaveCount(1);
        expect($sender->sent[0]['phone'])->toBe('+963911222333');
        preg_match('/\d{6}/', $sender->sent[0]['message'], $match);
        $cached = Cache::get("phone_otp_{$client->id}");
        expect($cached['phone'])->toBe('+963911222333')
            ->and($cached)->not->toContain($match[0])
            ->and(Hash::check($match[0], $cached['code_hash']))->toBeTrue();
        expect($client->fresh()->phone)->toBeNull();
    });

    it('throttles the fourth request within a minute', function (): void {
        phoneOtpSender();
        $token = phoneOtpToken(ClientModel::factory()->create());

        foreach (range(1, 3) as $_) {
            $this->withToken($token)->postJson('/api/v1/client/phone/otp', ['phone' => '+963911222333'])->assertOk();
        }

        $this->withToken($token)->postJson('/api/v1/client/phone/otp', ['phone' => '+963911222333'])->assertTooManyRequests();
    });

    it('rejects a phone already verified on another client', function (): void {
        $sender = phoneOtpSender();
        ClientModel::factory()->phoneVerified('+963911222333')->create();
        $client = ClientModel::factory()->create();

        $this->withToken(phoneOtpToken($client))
            ->postJson('/api/v1/client/phone/otp', ['phone' => '+963911222333'])
            ->assertStatus(422);

        expect($sender->sent)->toBeEmpty();
    });

    it('validates the phone and requires authentication', function (): void {
        $client = ClientModel::factory()->create();

        $this->withToken(phoneOtpToken($client))->postJson('/api/v1/client/phone/otp', ['phone' => 'abc'])->assertStatus(422);
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        $this->postJson('/api/v1/client/phone/otp', ['phone' => '+963911222333'])->assertUnauthorized();
    });

    it('blocks clients whose email is unverified', function (): void {
        $sender = phoneOtpSender();
        $client = ClientModel::factory()->unverified()->create();

        $this->withToken(phoneOtpToken($client))
            ->postJson('/api/v1/client/phone/otp', ['phone' => '+963911222333'])
            ->assertForbidden();

        expect($sender->sent)->toBeEmpty();
    });
});

describe('POST /api/v1/client/phone/verify', function (): void {
    it('persists the phone and phone_verified_at on the correct code', function (): void {
        $client = ClientModel::factory()->create();
        seedPhoneOtp($client, '+963911222333');

        $this->withToken(phoneOtpToken($client))
            ->postJson('/api/v1/client/phone/verify', ['code' => '123456'])
            ->assertOk()
            ->assertJsonPath('data.phone', '+963911222333')
            ->assertJsonPath('data.phone_verified_at', fn ($value) => $value !== null);

        $fresh = $client->fresh();
        expect($fresh->phone)->toBe('+963911222333')->and($fresh->phone_verified_at)->not->toBeNull();
        expect(Cache::get("phone_otp_{$client->id}"))->toBeNull();
    });

    it('returns 422 and keeps the phone on a wrong code', function (): void {
        $client = ClientModel::factory()->create(['phone' => '+963900000000']);
        seedPhoneOtp($client, '+963911222333');

        $this->withToken(phoneOtpToken($client))
            ->postJson('/api/v1/client/phone/verify', ['code' => '654321'])
            ->assertStatus(422);

        $fresh = $client->fresh();
        expect($fresh->phone)->toBe('+963900000000')->and($fresh->phone_verified_at)->toBeNull();
    });

    it('returns 422 when the code expired or was never requested', function (): void {
        $client = ClientModel::factory()->create();

        $this->withToken(phoneOtpToken($client))
            ->postJson('/api/v1/client/phone/verify', ['code' => '123456'])
            ->assertStatus(422);

        expect($client->fresh()->phone_verified_at)->toBeNull();
    });

    it('invalidates the code after five wrong attempts', function (): void {
        $client = ClientModel::factory()->create();
        seedPhoneOtp($client, '+963911222333');
        $token = phoneOtpToken($client);

        foreach (range(1, 5) as $_) {
            $this->withToken($token)->postJson('/api/v1/client/phone/verify', ['code' => '000000'])->assertStatus(422);
        }

        expect(Cache::get("phone_otp_{$client->id}"))->toBeNull();
        expect($client->fresh()->phone_verified_at)->toBeNull();
    });

    it('refuses to verify a phone another client verified in the meantime', function (): void {
        $client = ClientModel::factory()->create();
        seedPhoneOtp($client, '+963911222333');
        ClientModel::factory()->phoneVerified('+963911222333')->create();

        $this->withToken(phoneOtpToken($client))
            ->postJson('/api/v1/client/phone/verify', ['code' => '123456'])
            ->assertStatus(422);

        expect($client->fresh()->phone_verified_at)->toBeNull();
    });
});

describe('PATCH /api/v1/client/profile phone', function (): void {
    it('rejects a changed phone and leaves it unchanged', function (): void {
        $client = ClientModel::factory()->phoneVerified('+963911222333')->create();

        $this->withToken(phoneOtpToken($client))
            ->patchJson('/api/v1/client/profile', ['phone' => '+963944444444'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phone'], 'errors');

        $fresh = $client->fresh();
        expect($fresh->phone)->toBe('+963911222333')->and($fresh->phone_verified_at)->not->toBeNull();
    });

    it('accepts an unchanged phone as a no-op', function (): void {
        $client = ClientModel::factory()->phoneVerified('+963911222333')->create();

        $this->withToken(phoneOtpToken($client))
            ->patchJson('/api/v1/client/profile', ['name' => 'Renamed', 'phone' => '0911222333'])
            ->assertOk()
            ->assertJsonPath('data.phone', '+963911222333')
            ->assertJsonPath('data.phone_verified_at', fn ($value) => $value !== null);
    });
});
