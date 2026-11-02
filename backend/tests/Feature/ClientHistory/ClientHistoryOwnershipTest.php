<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Modules\Barber\Models\BarberModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\Enums\HistoryMediaType;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    Storage::fake('local');
});

function clientHistoryFor(ClientModel $client): ClientServiceHistoryModel
{
    $barber = BarberModel::factory()->create();
    $service = OfferedServiceModel::factory()->create([
        'serviceable_id' => $barber->id,
        'serviceable_type' => ServiceableTypeEnum::Barber,
    ]);

    return ClientServiceHistoryModel::query()->create([
        'client_id' => $client->id,
        'barber_id' => $barber->id,
        'offered_service_id' => $service->id,
        'performed_at' => now()->subDay(),
    ]);
}

it('forbids rebooking another client history and creates no booking', function (): void {
    $history = clientHistoryFor(ClientModel::factory()->create());
    $actor = ClientModel::factory()->create();

    $this->actingAs($actor, 'client')
        ->postJson("/api/v1/client/history/{$history->id}/rebook", [
            'starts_at' => now()->addDay()->toIso8601String(),
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('bookings', 0);
});

it('forbids attaching media to another client history and creates no media', function (): void {
    $history = clientHistoryFor(ClientModel::factory()->create());
    $actor = ClientModel::factory()->create();

    $this->actingAs($actor, 'client')
        ->postJson("/api/v1/client/history/{$history->id}/media", [
            'photo' => UploadedFile::fake()->image('foreign-history.jpg'),
            'photo_type' => HistoryMediaType::After,
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('client_service_history_media', 0);
});

it('returns not found for a missing history record on rebook', function (): void {
    $client = ClientModel::factory()->create();

    $this->actingAs($client, 'client')
        ->postJson('/api/v1/client/history/missing-history/rebook', ['starts_at' => now()->addDay()->toIso8601String()])
        ->assertNotFound();
});

it('returns not found for a missing history record on media upload', function (): void {
    $client = ClientModel::factory()->create();

    $this->actingAs($client, 'client')
        ->postJson('/api/v1/client/history/missing-history/media', [
            'photo' => UploadedFile::fake()->image('missing-history.jpg'),
            'photo_type' => HistoryMediaType::After,
        ])
        ->assertNotFound();
});

it('allows an owner to rebook and attach media to their history', function (): void {
    $client = ClientModel::factory()->create();
    $history = clientHistoryFor($client);

    $this->actingAs($client, 'client')
        ->postJson("/api/v1/client/history/{$history->id}/rebook", [
            'starts_at' => now()->addDay()->toIso8601String(),
        ])
        ->assertCreated();

    $this->actingAs($client, 'client')
        ->postJson("/api/v1/client/history/{$history->id}/media", [
            'photo' => UploadedFile::fake()->image('owned-history.jpg'),
            'photo_type' => HistoryMediaType::After,
        ])
        ->assertCreated();

    $this->assertDatabaseCount('bookings', 1);
    $this->assertDatabaseCount('client_service_history_media', 1);
});
