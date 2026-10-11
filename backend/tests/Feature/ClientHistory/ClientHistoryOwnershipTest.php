<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;

function clientHistoryFor(ClientModel $client): ClientServiceHistoryModel
{
    return ClientServiceHistoryModel::query()->create([
        'client_id' => $client->id,
        'barber_id' => BarberModel::factory()->create()->id,
        'performed_at' => now()->subDay(),
    ]);
}

it('forbids rebooking another client history and creates no booking', function (): void {
    $history = clientHistoryFor(ClientModel::factory()->create());
    $actor = ClientModel::factory()->create();

    $this->actingAs($actor, 'client')
        ->postJson("/api/v1/client/history/{$history->id}/rebook", [
            'time_slot' => now()->addDay()->toIso8601String(),
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('bookings', 0);
});

it('forbids attaching media to another client history and creates no media', function (): void {
    $history = clientHistoryFor(ClientModel::factory()->create());
    $actor = ClientModel::factory()->create();

    $this->actingAs($actor, 'client')
        ->postJson("/api/v1/client/history/{$history->id}/media", [
            'photo_url' => 'https://example.com/foreign-history.jpg',
            'photo_type' => 'after',
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('client_service_history_media', 0);
});

it('returns not found for missing client history records', function (string $endpoint, array $payload): void {
    $client = ClientModel::factory()->create();

    $this->actingAs($client, 'client')
        ->postJson("/api/v1/client/history/missing-history/{$endpoint}", $payload)
        ->assertNotFound();
})->with([
    'rebook' => ['rebook', ['time_slot' => now()->addDay()->toIso8601String()]],
    'media' => ['media', ['photo_url' => 'https://example.com/missing-history.jpg', 'photo_type' => 'after']],
]);

it('allows an owner to rebook and attach media to their history', function (): void {
    $client = ClientModel::factory()->create();
    $history = clientHistoryFor($client);

    $this->actingAs($client, 'client')
        ->postJson("/api/v1/client/history/{$history->id}/rebook", [
            'time_slot' => now()->addDay()->toIso8601String(),
        ])
        ->assertCreated();

    $this->actingAs($client, 'client')
        ->postJson("/api/v1/client/history/{$history->id}/media", [
            'photo_url' => 'https://example.com/owned-history.jpg',
            'photo_type' => 'after',
        ])
        ->assertCreated();

    $this->assertDatabaseCount('bookings', 1);
    $this->assertDatabaseCount('client_service_history_media', 1);
});
