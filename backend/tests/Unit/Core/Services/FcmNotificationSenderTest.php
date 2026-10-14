<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Modules\Core\Models\DeviceTokenModel;
use Modules\Core\Services\FcmNotificationSender;

uses(RefreshDatabase::class);

function configureFcmCredentials(): void
{
    $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
    openssl_pkey_export($key, $privateKey);

    config([
        'services.fcm.project_id' => 'dorak-test-project',
        'services.fcm.credentials' => json_encode([
            'client_email' => 'fcm-test@dorak-test-project.iam.gserviceaccount.com',
            'private_key' => $privateKey,
        ], JSON_THROW_ON_ERROR),
    ]);
}

function registerFcmToken(string $token): DeviceTokenModel
{
    return DeviceTokenModel::query()->create([
        'user_id' => '00000000-0000-4000-8000-000000000001',
        'user_type' => 'client',
        'token' => $token,
        'platform' => 'android',
        'last_used_at' => now(),
    ]);
}

it('sends every device token through FCM HTTP v1 with an OAuth bearer token', function (): void {
    configureFcmCredentials();
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'oauth-access-token', 'expires_in' => 3600]),
        'https://fcm.googleapis.com/v1/projects/dorak-test-project/messages:send' => Http::response(['name' => 'projects/dorak-test-project/messages/1']),
    ]);
    registerFcmToken('first-device-token');
    registerFcmToken('second-device-token');

    app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', 'Title', 'Body', ['type' => 'booking_status']);

    Http::assertSent(function (Request $request): bool {
        return str_contains($request->url(), '/v1/projects/dorak-test-project/messages:send')
            && $request->hasHeader('Authorization', 'Bearer oauth-access-token')
            && in_array($request['message']['token'] ?? null, ['first-device-token', 'second-device-token'], true);
    });
    expect(Http::recorded()->filter(fn (array $pair): bool => str_contains($pair[0]->url(), '/messages:send')))->toHaveCount(2);
    expect(Http::recorded()->filter(fn (array $pair): bool => $pair[0]->url() === 'https://oauth2.googleapis.com/token'))->toHaveCount(1);
    Http::assertNotSent(fn (Request $request): bool => str_contains($request->url(), '/fcm/send'));
});

it('prunes an unregistered token and continues sending to other devices', function (): void {
    configureFcmCredentials();
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'oauth-access-token', 'expires_in' => 3600]),
        'https://fcm.googleapis.com/v1/projects/dorak-test-project/messages:send' => fn (Request $request) => ($request['message']['token'] ?? null) === 'invalid-device-token'
            ? Http::response(['error' => [
                'status' => 'NOT_FOUND',
                'details' => [[
                    '@type' => 'type.googleapis.com/google.firebase.fcm.v1.FcmError',
                    'errorCode' => 'UNREGISTERED',
                ]],
            ]], 404)
            : Http::response(['name' => 'projects/dorak-test-project/messages/2']),
    ]);
    $invalid = registerFcmToken('invalid-device-token');
    $valid = registerFcmToken('valid-device-token');

    app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', 'Title', 'Body', []);

    expect(DeviceTokenModel::query()->find($invalid->id))->toBeNull()
        ->and(DeviceTokenModel::query()->find($valid->id))->not->toBeNull();
    expect(Http::recorded()->filter(fn (array $pair): bool => str_contains($pair[0]->url(), '/messages:send')))->toHaveCount(2);
});

it('logs one warning and skips delivery when credentials are missing', function (): void {
    config(['services.fcm.project_id' => '', 'services.fcm.credentials' => null]);
    Http::fake();
    Log::spy();
    registerFcmToken('device-token');
    $sender = app(FcmNotificationSender::class);

    $sender->sendTo('client', '00000000-0000-4000-8000-000000000001', 'Title', 'Body', []);
    $sender->sendTo('client', '00000000-0000-4000-8000-000000000001', 'Title', 'Body', []);

    Http::assertNothingSent();
    Log::shouldHaveReceived('warning')->once()->with('FCM delivery skipped because project credentials are missing.');
});

it('retries a 503 response and lets the queue retry the job after exhaustion', function (): void {
    configureFcmCredentials();
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'oauth-access-token', 'expires_in' => 3600]),
        'https://fcm.googleapis.com/v1/projects/dorak-test-project/messages:send' => Http::response(['error' => ['status' => 'UNAVAILABLE']], 503),
    ]);
    registerFcmToken('device-token');

    expect(fn () => app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', 'Title', 'Body', []))
        ->toThrow(RequestException::class);
    expect(Http::recorded()->filter(fn (array $pair): bool => str_contains($pair[0]->url(), '/messages:send')))->toHaveCount(3);
});
