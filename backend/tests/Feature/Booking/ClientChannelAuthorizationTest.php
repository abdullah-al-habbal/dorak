<?php

declare(strict_types=1);

use Illuminate\Broadcasting\BroadcastManager;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Testing\TestResponse;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Events\BookingCancelledEvent;
use Modules\Booking\Events\BookingCreatedEvent;
use Modules\Booking\Events\BookingRescheduledEvent;
use Modules\Booking\Events\BookingStatusUpdatedEvent;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;

// The suite broadcasts through the null driver, which authorizes everything.
// Authorization tests need the signing driver with the real channel definitions.
beforeEach(function (): void {
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'test-key',
        'broadcasting.connections.reverb.secret' => 'test-secret',
        'broadcasting.connections.reverb.app_id' => 'test-app',
    ]);
    app(BroadcastManager::class)->purge('reverb');
    require base_path('modules/Core/Routes/channels.php');
});

function broadcastAuth(object $test, ?string $token, string $channel): TestResponse
{
    $request = $test->withHeaders($token === null ? [] : ['Authorization' => 'Bearer '.$token]);

    return $request->postJson('/api/v1/broadcasting/auth', [
        'socket_id' => '1234.5678',
        'channel_name' => $channel,
    ]);
}

it('authorizes a client on their own private channel', function (): void {
    $client = ClientModel::factory()->create();
    $token = $client->createToken('test')->plainTextToken;

    broadcastAuth($this, $token, 'private-client.'.$client->id)->assertOk();
});

it('forbids a client from another client private channel', function (): void {
    $client = ClientModel::factory()->create();
    $other = ClientModel::factory()->create();
    $token = $client->createToken('test')->plainTextToken;

    broadcastAuth($this, $token, 'private-client.'.$other->id)->assertForbidden();
});

it('rejects unauthenticated channel authorization', function (): void {
    $client = ClientModel::factory()->create();

    broadcastAuth($this, null, 'private-client.'.$client->id)->assertUnauthorized();
});

it('forbids barber and branch tokens on client channels', function (): void {
    $client = ClientModel::factory()->create();
    $barberToken = BarberModel::factory()->create()->createToken('test')->plainTextToken;
    $branchToken = BranchModel::factory()->create()->createToken('test')->plainTextToken;

    broadcastAuth($this, $barberToken, 'private-client.'.$client->id)->assertForbidden();
    broadcastAuth($this, $branchToken, 'private-client.'.$client->id)->assertForbidden();
});

it('forbids a client token on branch and barber channels', function (): void {
    $client = ClientModel::factory()->create();
    $token = $client->createToken('test')->plainTextToken;

    broadcastAuth($this, $token, 'private-branch.'.BranchModel::factory()->create()->id)->assertForbidden();
    broadcastAuth($this, $token, 'private-barber.'.BarberModel::factory()->create()->id)->assertForbidden();
});

it('broadcasts every booking event on the client channel without leaking the client id', function (): void {
    $events = [
        new BookingCreatedEvent('booking-1', 'branch-1', 'client-1'),
        new BookingStatusUpdatedEvent('booking-1', 'branch-1', 'barber-1', 'confirmed', 'client-1'),
        new BookingCancelledEvent('booking-1', 'branch-1', 'barber-1', 'client-1'),
        new BookingRescheduledEvent('booking-1', 'branch-1', 'barber-1', '2026-01-01T10:00:00+00:00', 'client-1'),
    ];

    foreach ($events as $event) {
        $names = array_map(fn (PrivateChannel $channel): string => $channel->name, $event->broadcastOn());

        expect($names)->toContain('private-client.client-1')
            ->and(array_keys(get_object_vars($event)))->not->toContain('clientId');
    }
});
