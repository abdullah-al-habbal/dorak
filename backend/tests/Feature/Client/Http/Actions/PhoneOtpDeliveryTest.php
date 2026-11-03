<?php

declare(strict_types=1);

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Modules\Client\Models\ClientModel;

function genericHttpDriver(): void
{
    config([
        'services.sms.driver' => 'generic_http',
        'services.sms.http' => [
            'url' => 'https://gateway.test/send',
            'format' => 'json',
            'headers' => '{"Authorization":"Bearer test"}',
            'payload' => '{"to":"{{phone}}","text":"{{message}}"}',
            'timeout' => '5',
        ],
    ]);
}

function deliveryToken(ClientModel $client): string
{
    return $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;
}

describe('phone OTP through the generic http driver', function (): void {
    it('delivers the code to the gateway and verifies it end to end', function (): void {
        genericHttpDriver();
        Http::fake(['gateway.test/*' => Http::response(['ok' => true], 200)]);
        $client = ClientModel::factory()->create();
        $token = deliveryToken($client);

        $this->withToken($token)
            ->postJson('/api/v1/client/phone/otp', ['phone' => '0911 222 333'])
            ->assertOk();

        $code = null;
        Http::assertSent(function (Request $request) use (&$code): bool {
            preg_match('/\d{6}/', (string) $request['text'], $match);
            $code = $match[0] ?? null;

            return $request['to'] === '+963911222333' && $request->hasHeader('Authorization', 'Bearer test');
        });

        $this->withToken($token)
            ->postJson('/api/v1/client/phone/verify', ['code' => $code])
            ->assertOk()
            ->assertJsonPath('data.phone', '+963911222333');

        expect($client->fresh()->phone_verified_at)->not->toBeNull();
    });

    it('returns 503 and purges the cached code when the gateway rejects the message', function (): void {
        genericHttpDriver();
        Http::fake(['gateway.test/*' => Http::response('boom', 500)]);
        $client = ClientModel::factory()->create();
        $token = deliveryToken($client);

        $this->withToken($token)
            ->postJson('/api/v1/client/phone/otp', ['phone' => '+963911222333'])
            ->assertStatus(503)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'SERVICE_UNAVAILABLE');

        expect(Cache::get("phone_otp_{$client->id}"))->toBeNull();

        $this->withToken($token)
            ->postJson('/api/v1/client/phone/verify', ['code' => '123456'])
            ->assertStatus(422);
        expect($client->fresh()->phone_verified_at)->toBeNull();
    });

    it('returns 503 when the gateway is unreachable', function (): void {
        genericHttpDriver();
        Http::fake(fn () => throw new ConnectionException('timed out'));
        $client = ClientModel::factory()->create();

        $this->withToken(deliveryToken($client))
            ->postJson('/api/v1/client/phone/otp', ['phone' => '+963911222333'])
            ->assertStatus(503);

        expect(Cache::get("phone_otp_{$client->id}"))->toBeNull();
    });

    it('invalidates a previously valid pending code when a resend fails', function (): void {
        genericHttpDriver();
        $client = ClientModel::factory()->create();
        Cache::put("phone_otp_{$client->id}", ['phone' => '+963911222333', 'code_hash' => bcrypt('123456')], now()->addMinutes(10));
        Http::fake(['gateway.test/*' => Http::response('', 502)]);

        $this->withToken(deliveryToken($client))
            ->postJson('/api/v1/client/phone/otp', ['phone' => '+963911222333'])
            ->assertStatus(503);

        expect(Cache::get("phone_otp_{$client->id}"))->toBeNull();
    });
});
