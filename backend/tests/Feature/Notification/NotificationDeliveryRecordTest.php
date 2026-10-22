<?php

declare(strict_types=1);

use Illuminate\Console\Scheduling\Event as ScheduledEvent;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Jobs\SendBookingStatusNotificationJob;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\NotificationDeliveryStatusEnum;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Models\DeviceTokenModel;
use Modules\Core\Models\NotificationDeliveryModel;
use Modules\Core\Models\NotificationModel;
use Modules\Core\Services\FcmNotificationSender;

function configureDeliveryRecordFcm(): void
{
    $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
    openssl_pkey_export($key, $privateKey);
    config([
        'services.fcm.project_id' => 'dorak-test-project',
        'services.fcm.credentials' => json_encode(['client_email' => 'fcm@dorak-test-project.iam.gserviceaccount.com', 'private_key' => $privateKey], JSON_THROW_ON_ERROR),
    ]);
}

function deliveryRecordToken(string $userType, string $userId, string $token): DeviceTokenModel
{
    return DeviceTokenModel::query()->create(['user_id' => $userId, 'user_type' => $userType, 'token' => $token, 'platform' => 'android', 'last_used_at' => now()]);
}

/**
 * @param  Closure(Request): mixed  $send
 */
function fakeDeliveryRecordFcm(Closure $send): void
{
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 't', 'expires_in' => 3600]),
        'https://fcm.googleapis.com/*' => $send,
    ]);
}

function deliveryRecordPushes(string $token): int
{
    return Http::recorded()
        ->filter(fn (array $pair): bool => str_contains($pair[0]->url(), '/messages:send') && ($pair[0]['message']['token'] ?? null) === $token)
        ->count();
}

it('writes one notification and one sent delivery per device token on a booking transition', function (): void {
    configureDeliveryRecordFcm();
    fakeDeliveryRecordFcm(fn (Request $request) => Http::response(['name' => 'projects/dorak-test-project/messages/'.$request['message']['token']]));
    $client = ClientModel::factory()->create();
    $booking = BookingModel::factory()->create(['client_id' => $client->id, 'status' => BookingStatus::Confirmed]);
    $phone = deliveryRecordToken(ClientModel::class, $client->id, 'phone-token');
    $tablet = deliveryRecordToken(ClientModel::class, $client->id, 'tablet-token');

    (new SendBookingStatusNotificationJob((string) $booking->id, false))->handle(app(FcmNotificationSender::class));

    $notification = NotificationModel::query()->sole();
    expect($notification->notifiable_type)->toBe('client')
        ->and($notification->notifiable_id)->toBe($client->id)
        ->and($notification->type)->toBe(NotificationTypeEnum::BookingUpdate)
        ->and($notification->data)->toMatchArray(['type' => 'booking_status', 'booking_id' => $booking->id])
        ->and($notification->read_at)->toBeNull();
    $deliveries = NotificationDeliveryModel::query()->where('notification_id', $notification->id)->get();
    expect($deliveries)->toHaveCount(2)
        ->and($deliveries->pluck('status')->unique()->all())->toBe([NotificationDeliveryStatusEnum::Sent])
        ->and($deliveries->pluck('device_token_id')->sort()->values()->all())->toBe(collect([$phone->id, $tablet->id])->sort()->values()->all())
        ->and($deliveries->pluck('provider_message_id')->sort()->values()->all())->toBe([
            'projects/dorak-test-project/messages/phone-token',
            'projects/dorak-test-project/messages/tablet-token',
        ]);
});

it('records a failed delivery and still completes the booking transition when FCM rejects the push', function (): void {
    config(['queue.default' => 'sync']);
    configureDeliveryRecordFcm();
    fakeDeliveryRecordFcm(fn () => Http::response(['error' => ['status' => 'PERMISSION_DENIED', 'message' => 'Sender mismatch']], 403));
    $client = ClientModel::factory()->create();
    $barber = BarberModel::factory()->create();
    $booking = BookingModel::factory()->create(['client_id' => $client->id, 'barber_id' => $barber->id, 'status' => BookingStatus::Pending]);
    deliveryRecordToken(ClientModel::class, $client->id, 'client-token');
    $this->actingAs($barber, 'barber');

    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/accept")->assertOk();

    expect($booking->refresh()->status)->toBe(BookingStatus::Confirmed);
    $notification = NotificationModel::query()->where('notifiable_id', $client->id)->sole();
    $delivery = NotificationDeliveryModel::query()->where('notification_id', $notification->id)->sole();
    expect($delivery->status)->toBe(NotificationDeliveryStatusEnum::Failed)
        ->and($delivery->error)->toBe('HTTP 403 PERMISSION_DENIED: Sender mismatch')
        ->and($delivery->provider_message_id)->toBeNull();
});

it('keeps the failed delivery row when an unregistered token is pruned', function (): void {
    configureDeliveryRecordFcm();
    fakeDeliveryRecordFcm(fn () => Http::response(['error' => [
        'status' => 'NOT_FOUND',
        'details' => [['@type' => 'type.googleapis.com/google.firebase.fcm.v1.FcmError', 'errorCode' => 'UNREGISTERED']],
    ]], 404));
    $client = ClientModel::factory()->create();
    $token = deliveryRecordToken(ClientModel::class, $client->id, 'stale-token');

    app(FcmNotificationSender::class)->sendTo(ClientModel::class, $client->id, NotificationTypeEnum::BookingUpdate, 'Title', 'Body', []);

    expect(DeviceTokenModel::query()->find($token->id))->toBeNull();
    $delivery = NotificationDeliveryModel::query()->sole();
    expect($delivery->status)->toBe(NotificationDeliveryStatusEnum::Failed)
        ->and($delivery->device_token_id)->toBeNull()
        ->and($delivery->error)->toStartWith('HTTP 404 NOT_FOUND');
});

it('does not duplicate the notification or re-push delivered devices when the job retries', function (): void {
    configureDeliveryRecordFcm();
    $unavailable = true;
    fakeDeliveryRecordFcm(function (Request $request) use (&$unavailable) {
        return $unavailable && $request['message']['token'] === 'flaky-token'
            ? Http::response(['error' => ['status' => 'UNAVAILABLE']], 503)
            : Http::response(['name' => 'projects/dorak-test-project/messages/ok']);
    });
    $client = ClientModel::factory()->create();
    $booking = BookingModel::factory()->create(['client_id' => $client->id, 'status' => BookingStatus::Confirmed]);
    deliveryRecordToken(ClientModel::class, $client->id, 'steady-token');
    deliveryRecordToken(ClientModel::class, $client->id, 'flaky-token');
    $job = new SendBookingStatusNotificationJob((string) $booking->id, false);

    expect(fn () => $job->handle(app(FcmNotificationSender::class)))->toThrow(RequestException::class);
    $unavailable = false;
    $job->handle(app(FcmNotificationSender::class));

    expect(NotificationModel::query()->count())->toBe(1)
        ->and(deliveryRecordPushes('steady-token'))->toBe(1)
        ->and(NotificationDeliveryModel::query()->where('status', NotificationDeliveryStatusEnum::Sent)->count())->toBe(2)
        ->and(NotificationDeliveryModel::query()->where('status', NotificationDeliveryStatusEnum::Failed)->count())->toBe(1);
});

it('still writes the inbox notification when FCM is not configured or no device is registered', function (): void {
    config(['services.fcm.project_id' => '', 'services.fcm.credentials' => null]);
    Http::fake();
    $client = ClientModel::factory()->create();
    $barber = BarberModel::factory()->create();
    deliveryRecordToken(ClientModel::class, $client->id, 'client-token');
    $sender = app(FcmNotificationSender::class);

    $sender->sendTo(ClientModel::class, $client->id, NotificationTypeEnum::BookingUpdate, 'Title', 'Body', []);
    configureDeliveryRecordFcm();
    $sender->sendTo(BarberModel::class, $barber->id, NotificationTypeEnum::BookingUpdate, 'Title', 'Body', []);

    expect(NotificationModel::query()->pluck('notifiable_type')->sort()->values()->all())->toBe(['barber', 'client'])
        ->and(NotificationDeliveryModel::query()->count())->toBe(0);
    Http::assertNothingSent();
});

it('prunes delivery rows older than the retention period and schedules the prune daily', function (): void {
    $notification = NotificationModel::query()->create([
        'notifiable_type' => 'client', 'notifiable_id' => ClientModel::factory()->create()->id,
        'type' => NotificationTypeEnum::BookingUpdate, 'title' => 'T', 'body' => 'B', 'data' => [],
    ]);
    $old = NotificationDeliveryModel::query()->create(['notification_id' => $notification->id, 'status' => NotificationDeliveryStatusEnum::Sent, 'attempted_at' => now()->subDays(91)]);
    $recent = NotificationDeliveryModel::query()->create(['notification_id' => $notification->id, 'status' => NotificationDeliveryStatusEnum::Sent, 'attempted_at' => now()->subDays(89)]);

    $this->artisan('model:prune', ['--model' => [NotificationDeliveryModel::class]])->assertSuccessful();

    expect(NotificationDeliveryModel::query()->find($old->id))->toBeNull()
        ->and(NotificationDeliveryModel::query()->find($recent->id))->not->toBeNull()
        ->and(NotificationModel::query()->find($notification->id))->not->toBeNull();
    $commands = collect(app(Schedule::class)->events())->map(fn (ScheduledEvent $event): string => (string) $event->command);
    expect($commands->contains(fn (string $command): bool => str_contains($command, 'model:prune') && str_contains($command, 'NotificationDeliveryModel')))->toBeTrue();
});
