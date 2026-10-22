<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Model;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Models\NotificationModel;

function inboxNotificationFor(Model $actor, array $attributes = []): NotificationModel
{
    return NotificationModel::query()->create([
        'notifiable_type' => $actor->getMorphClass(),
        'notifiable_id' => $actor->getKey(),
        'type' => NotificationTypeEnum::BookingUpdate,
        'title' => 'Booking updated',
        'body' => 'Your booking is confirmed',
        'data' => ['booking_id' => 'b-1'],
        ...$attributes,
    ]);
}

it('lists only the caller\'s notifications, unread first, with the unread count', function (string $guard, Closure $makeActor): void {
    $actor = $makeActor();
    $other = ClientModel::factory()->create();
    $readNewest = inboxNotificationFor($actor, ['read_at' => now(), 'created_at' => now()]);
    $unreadOld = inboxNotificationFor($actor, ['created_at' => now()->subDays(2)]);
    $unreadNew = inboxNotificationFor($actor, ['created_at' => now()->subDay()]);
    inboxNotificationFor($other);
    $this->actingAs($actor, $guard);

    $response = $this->getJson('/api/v1/notifications')->assertOk();

    expect(array_column($response->json('data'), 'id'))->toBe([$unreadNew->id, $unreadOld->id, $readNewest->id])
        ->and($response->json('meta.unread_count'))->toBe(2)
        ->and($response->json('meta.pagination.total'))->toBe(3)
        ->and($response->json('data.0'))->toMatchArray([
            'type' => 'booking_update',
            'title' => 'Booking updated',
            'body' => 'Your booking is confirmed',
            'data' => ['booking_id' => 'b-1'],
            'read_at' => null,
        ]);
})->with([
    'client' => ['client', fn () => ClientModel::factory()->create()],
    'barber' => ['barber', fn () => BarberModel::factory()->create()],
    'branch' => ['branch_api', fn () => BranchModel::factory()->create()],
]);

it('paginates the inbox with per_page', function (): void {
    $client = ClientModel::factory()->create();
    foreach (range(1, 3) as $_) {
        inboxNotificationFor($client);
    }
    $this->actingAs($client, 'client');

    $this->getJson('/api/v1/notifications?per_page=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.pagination.total_pages', 2)
        ->assertJsonPath('meta.unread_count', 3);
    $this->getJson('/api/v1/notifications?per_page=101')->assertUnprocessable();
});

it('marks a notification read idempotently', function (): void {
    $barber = BarberModel::factory()->create();
    $notification = inboxNotificationFor($barber);
    $this->actingAs($barber, 'barber');

    $first = $this->patchJson("/api/v1/notifications/{$notification->id}/read")->assertOk();
    $readAt = $first->json('data.read_at');
    $this->travel(5)->minutes();
    $second = $this->patchJson("/api/v1/notifications/{$notification->id}/read")->assertOk();

    expect($readAt)->not->toBeNull()
        ->and($second->json('data.read_at'))->toBe($readAt)
        ->and($second->json('data.id'))->toBe($notification->id)
        ->and($notification->refresh()->read_at)->not->toBeNull();
});

it('returns 404 when reading another actor\'s notification', function (): void {
    $client = ClientModel::factory()->create();
    $branch = BranchModel::factory()->create();
    $foreign = inboxNotificationFor($branch);
    $this->actingAs($client, 'client');

    $this->patchJson("/api/v1/notifications/{$foreign->id}/read")
        ->assertNotFound()
        ->assertJsonPath('code', 'RESOURCE_NOT_FOUND');
    $this->patchJson('/api/v1/notifications/00000000-0000-4000-8000-000000000000/read')->assertNotFound();

    expect($foreign->refresh()->read_at)->toBeNull();
});

it('does not leak a notification across actor types that share an id', function (): void {
    $branch = BranchModel::factory()->create();
    $notification = NotificationModel::query()->create([
        'notifiable_type' => 'barber', 'notifiable_id' => $branch->id,
        'type' => NotificationTypeEnum::BookingUpdate, 'title' => 'T', 'body' => 'B', 'data' => [],
    ]);
    $this->actingAs($branch, 'branch_api');

    $this->getJson('/api/v1/notifications')->assertOk()->assertJsonCount(0, 'data');
    $this->patchJson("/api/v1/notifications/{$notification->id}/read")->assertNotFound();
});

it('marks all of the caller\'s notifications read and leaves others untouched', function (): void {
    $client = ClientModel::factory()->create();
    $other = ClientModel::factory()->create();
    inboxNotificationFor($client);
    inboxNotificationFor($client);
    inboxNotificationFor($client, ['read_at' => now()->subDay()]);
    $foreign = inboxNotificationFor($other);
    $this->actingAs($client, 'client');

    $this->postJson('/api/v1/notifications/read-all')
        ->assertOk()
        ->assertJsonPath('data.updated', 2)
        ->assertJsonPath('data.unread_count', 0);
    $this->postJson('/api/v1/notifications/read-all')->assertOk()->assertJsonPath('data.updated', 0);

    $this->getJson('/api/v1/notifications')->assertJsonPath('meta.unread_count', 0);
    expect($foreign->refresh()->read_at)->toBeNull();
});

it('rejects guests and inactive clients', function (): void {
    $this->getJson('/api/v1/notifications')->assertUnauthorized();
    $this->postJson('/api/v1/notifications/read-all')->assertUnauthorized();

    $disabled = ClientModel::factory()->create(['status' => ClientStatusEnum::Disabled]);
    $this->actingAs($disabled, 'client');
    $this->getJson('/api/v1/notifications')->assertForbidden();
});

it('serves the dashboard branch session through the branch_api guard', function (): void {
    $branch = BranchModel::factory()->create();
    $notification = inboxNotificationFor($branch);
    $this->authenticateDashboardActor($branch);

    $this->getJson('/api/v1/notifications')->assertOk()->assertJsonPath('data.0.id', $notification->id);
    $this->patchJson("/api/v1/notifications/{$notification->id}/read")->assertOk();
});
