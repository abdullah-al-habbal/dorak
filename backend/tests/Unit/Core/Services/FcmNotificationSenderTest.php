<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Models\DeviceTokenModel;
use Modules\Core\Services\FcmNotificationSender;
use Modules\Core\Services\LocalizedNotificationMessage;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Models\PreferenceModel;

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
        'user_type' => DeviceTokenUserTypeEnum::Client,
        'token' => $token,
        'platform_type' => 'android',
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

    app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', NotificationTypeEnum::BookingUpdate, 'Title', 'Body', ['type' => 'booking_status']);

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

    app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', NotificationTypeEnum::BookingUpdate, 'Title', 'Body', []);

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

    $sender->sendTo('client', '00000000-0000-4000-8000-000000000001', NotificationTypeEnum::BookingUpdate, 'Title', 'Body', []);
    $sender->sendTo('client', '00000000-0000-4000-8000-000000000001', NotificationTypeEnum::BookingUpdate, 'Title', 'Body', []);

    Http::assertNothingSent();
    Log::shouldHaveReceived('warning')->once()->with('FCM delivery skipped because project credentials are missing.', ['reason' => 'project_id_missing']);
});

it('retries a 503 response and lets the queue retry the job after exhaustion', function (): void {
    configureFcmCredentials();
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'oauth-access-token', 'expires_in' => 3600]),
        'https://fcm.googleapis.com/v1/projects/dorak-test-project/messages:send' => Http::response(['error' => ['status' => 'UNAVAILABLE']], 503),
    ]);
    registerFcmToken('device-token');

    expect(fn () => app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', NotificationTypeEnum::BookingUpdate, 'Title', 'Body', []))
        ->toThrow(RequestException::class);
    expect(Http::recorded()->filter(fn (array $pair): bool => str_contains($pair[0]->url(), '/messages:send')))->toHaveCount(3);
});

it('logs why delivery is skipped for each misconfiguration and never logs the credentials', function (?string $credentials, string $reason): void {
    config(['services.fcm.project_id' => 'dorak-test', 'services.fcm.credentials' => $credentials]);
    Http::fake();
    Log::spy();
    registerFcmToken('device-token');

    $notification = app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', NotificationTypeEnum::BookingUpdate, 'Title', 'Body', []);

    Http::assertNothingSent();
    expect($notification->exists)->toBeTrue();
    Log::shouldHaveReceived('warning')->once()->with('FCM delivery skipped because project credentials are missing.', ['reason' => $reason]);
})->with([
    'not set' => [null, 'credentials_missing'],
    'path that is not a file' => ['/nonexistent/fcm-service-account.json', 'credentials_unreadable'],
    'inline json without a key' => ['{"client_email":"sa@example.test","private_key":"SECRET-KEY-MATERIAL"}x', 'credentials_invalid'],
    'inline json missing the private key' => ['{"client_email":"sa@example.test"}', 'credentials_invalid'],
]);

it('skips a revoked device token', function (): void {
    configureFcmCredentials();
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'oauth-access-token', 'expires_in' => 3600]),
        'https://fcm.googleapis.com/v1/projects/dorak-test-project/messages:send' => Http::response(['name' => 'projects/dorak-test-project/messages/3']),
    ]);
    registerFcmToken('active-device-token');
    registerFcmToken('revoked-device-token')->forceFill(['revoked_at' => now()])->save();

    app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', NotificationTypeEnum::BookingUpdate, 'Title', 'Body', ['type' => 'booking_status']);

    Http::assertSent(fn (Request $request): bool => ($request['message']['token'] ?? null) === 'active-device-token');
    Http::assertNotSent(fn (Request $request): bool => ($request['message']['token'] ?? null) === 'revoked-device-token');
});

it('writes each device push in the device language and adds android and apns delivery settings', function (): void {
    configureFcmCredentials();
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'oauth-access-token', 'expires_in' => 3600]),
        'https://fcm.googleapis.com/v1/projects/dorak-test-project/messages:send' => Http::response(['name' => 'projects/dorak-test-project/messages/4']),
    ]);
    registerFcmToken('arabic-device')->forceFill(['locale' => 'ar'])->save();
    registerFcmToken('english-device')->forceFill(['locale' => 'en'])->save();
    registerFcmToken('unknown-locale-device');

    app(FcmNotificationSender::class)->sendMessage(
        'client',
        '00000000-0000-4000-8000-000000000001',
        NotificationTypeEnum::ReviewRequest,
        LocalizedNotificationMessage::translated('review::messages.notification_review_request_title', 'review::messages.notification_review_request_body'),
        ['type' => 'review_request'],
    );

    $titles = Http::recorded()
        ->filter(fn (array $pair): bool => str_contains($pair[0]->url(), '/messages:send'))
        ->mapWithKeys(fn (array $pair): array => [$pair[0]['message']['token'] => $pair[0]['message']]);

    expect($titles['arabic-device']['notification']['title'])->toBe(trans('review::messages.notification_review_request_title', [], 'ar'))
        ->and($titles['english-device']['notification']['title'])->toBe(trans('review::messages.notification_review_request_title', [], 'en'))
        ->and($titles['unknown-locale-device']['notification']['title'])->toBe(trans('review::messages.notification_review_request_title', [], 'en'))
        ->and($titles['arabic-device']['notification']['title'])->not->toBe($titles['english-device']['notification']['title'])
        ->and($titles['english-device']['android']['priority'])->toBe('HIGH')
        ->and($titles['english-device']['android']['notification']['channel_id'])->toBe('dorak_default')
        ->and($titles['english-device']['apns']['headers']['apns-priority'])->toBe('10')
        ->and($titles['english-device']['apns']['payload']['aps']['sound'])->toBe('default');
});

it('writes the inbox row in the recipient stored language, not the request language', function (): void {
    app()->setLocale('en');
    $client = ClientModel::factory()->create();
    PreferenceModel::query()->create([
        'preferenceable_type' => PreferenceableTypeEnum::Client->value,
        'preferenceable_id' => $client->id,
        'preferred_language' => 'ar',
    ]);

    $notification = app(FcmNotificationSender::class)->sendMessage(
        'client',
        $client->id,
        NotificationTypeEnum::ReviewRequest,
        LocalizedNotificationMessage::translated('review::messages.notification_review_request_title', 'review::messages.notification_review_request_body'),
        ['type' => 'review_request'],
    );

    expect($notification->title)->toBe(trans('review::messages.notification_review_request_title', [], 'ar'));
});

it('sends a browser device a web push payload with the language and direction, and no android or apns block', function (): void {
    configureFcmCredentials();
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'oauth-access-token', 'expires_in' => 3600]),
        'https://fcm.googleapis.com/v1/projects/dorak-test-project/messages:send' => Http::response(['name' => 'projects/dorak-test-project/messages/1']),
    ]);
    DeviceTokenModel::query()->create([
        'user_id' => '00000000-0000-4000-8000-000000000001',
        'user_type' => DeviceTokenUserTypeEnum::Client,
        'token' => 'browser-device-token',
        'platform_type' => 'web',
        'locale' => 'ar',
        'last_used_at' => now(),
    ]);

    app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', NotificationTypeEnum::BookingUpdate, 'Title', 'Body', ['type' => 'booking_status']);

    Http::assertSent(function (Request $request): bool {
        if (! str_contains($request->url(), 'messages:send')) {
            return false;
        }
        $message = $request['message'];

        return $message['token'] === 'browser-device-token'
            && $message['webpush']['notification'] === ['title' => 'Title', 'body' => 'Body', 'lang' => 'ar', 'dir' => 'rtl']
            && $message['webpush']['headers']['Urgency'] === 'high'
            && ! array_key_exists('android', $message)
            && ! array_key_exists('apns', $message)
            && ! array_key_exists('notification', $message);
    });
});

/** @return array<string, mixed> */
function fcmInvalidArgumentError(string $message, ?string $badField = null): array
{
    $details = [['@type' => 'type.googleapis.com/google.firebase.fcm.v1.FcmError', 'errorCode' => 'INVALID_ARGUMENT']];
    if ($badField !== null) {
        $details[] = ['@type' => 'type.googleapis.com/google.rpc.BadRequest', 'fieldViolations' => [['field' => $badField]]];
    }

    return ['error' => ['code' => 400, 'status' => 'INVALID_ARGUMENT', 'message' => $message, 'details' => $details]];
}

it('keeps the device token when FCM blames the payload for an invalid argument', function (string $message, ?string $badField): void {
    configureFcmCredentials();
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'oauth-access-token', 'expires_in' => 3600]),
        'https://fcm.googleapis.com/v1/projects/dorak-test-project/messages:send' => Http::response(fcmInvalidArgumentError($message, $badField), 400),
    ]);
    $token = registerFcmToken('healthy-device-token');

    app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', NotificationTypeEnum::BookingUpdate, 'Title', 'Body', []);

    expect(DeviceTokenModel::query()->find($token->id))->not->toBeNull();
})->with([
    'message too big' => ['Message is too big', null],
    'bad data field' => ['Invalid value at message.data[0].value', 'message.data[0].value'],
    'data key that mentions a token' => ['Invalid data payload key: token', 'message.data'],
]);

it('deletes the device token when FCM says the token itself is invalid', function (string $message, ?string $badField): void {
    configureFcmCredentials();
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'oauth-access-token', 'expires_in' => 3600]),
        'https://fcm.googleapis.com/v1/projects/dorak-test-project/messages:send' => Http::response(fcmInvalidArgumentError($message, $badField), 400),
    ]);
    $token = registerFcmToken('malformed-device-token');

    app(FcmNotificationSender::class)->sendTo('client', '00000000-0000-4000-8000-000000000001', NotificationTypeEnum::BookingUpdate, 'Title', 'Body', []);

    expect(DeviceTokenModel::query()->find($token->id))->toBeNull();
})->with([
    'registration token message' => ['The registration token is not a valid FCM registration token', null],
    'token field violation' => ['Request contains an invalid argument.', 'message.token'],
]);
