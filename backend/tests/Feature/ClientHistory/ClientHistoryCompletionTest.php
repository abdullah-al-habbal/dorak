<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\Enums\HistoryMediaType;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\OfferedService\Models\OfferedServiceModel;

function historyForClientAndBarber(ClientModel $client, ?BarberModel $barber = null): ClientServiceHistoryModel
{
    $service = OfferedServiceModel::factory()->create();

    return ClientServiceHistoryModel::query()->create([
        'client_id' => $client->id,
        'barber_id' => $barber?->id,
        'offered_service_id' => $service->id,
        'performed_at' => now()->subDay(),
    ]);
}

describe('PATCH /client/history/{history}', function () {
    it('lets the owner persist rating and notes', function () {
        $client = ClientModel::factory()->create();
        $history = historyForClientAndBarber($client);

        $this->actingAs($client, 'client')
            ->patchJson("/api/v1/client/history/{$history->id}", [
                'client_rating' => 5,
                'client_notes' => 'Loved it',
            ])
            ->assertOk()
            ->assertJsonPath('data.client_rating', 5)
            ->assertJsonPath('data.client_notes', 'Loved it');

        expect($history->fresh()->client_rating)->toBe(5);
    });

    it('forbids another client from updating the history', function () {
        $owner = ClientModel::factory()->create();
        $history = historyForClientAndBarber($owner);
        $other = ClientModel::factory()->create();

        $this->actingAs($other, 'client')
            ->patchJson("/api/v1/client/history/{$history->id}", ['client_rating' => 4])
            ->assertForbidden();
    });

    it('returns not found for a missing history row', function () {
        $client = ClientModel::factory()->create();

        $this->actingAs($client, 'client')
            ->patchJson('/api/v1/client/history/missing-history', ['client_rating' => 4])
            ->assertNotFound();
    });

    it('rejects an out-of-range rating with 422', function () {
        $client = ClientModel::factory()->create();
        $history = historyForClientAndBarber($client);

        $this->actingAs($client, 'client')
            ->patchJson("/api/v1/client/history/{$history->id}", ['client_rating' => 6])
            ->assertStatus(422)
            ->assertJsonValidationErrors('client_rating');

        expect($history->fresh()->client_rating)->toBeNull();
    });
});

describe('PATCH /barber/history/{history}/notes', function () {
    it('lets the booking barber write barber_notes', function () {
        $barber = BarberModel::factory()->create();
        $history = historyForClientAndBarber(ClientModel::factory()->create(), $barber);

        $this->actingAs($barber, 'barber')
            ->patchJson("/api/v1/barber/history/{$history->id}/notes", ['barber_notes' => 'Prefers skin fade'])
            ->assertOk()
            ->assertJsonPath('data.barber_notes', 'Prefers skin fade');
    });

    it('forbids a barber who did not perform the service', function () {
        $history = historyForClientAndBarber(ClientModel::factory()->create(), BarberModel::factory()->create());
        $other = BarberModel::factory()->create();

        $this->actingAs($other, 'barber')
            ->patchJson("/api/v1/barber/history/{$history->id}/notes", ['barber_notes' => 'Nope'])
            ->assertForbidden();
    });
});

describe('POST /client/history/{history}/media', function () {
    beforeEach(function () {
        Storage::fake('local');
    });

    it('stores an uploaded photo privately and returns a signed URL', function () {
        $client = ClientModel::factory()->create();
        $history = historyForClientAndBarber($client);

        $response = $this->actingAs($client, 'client')
            ->postJson("/api/v1/client/history/{$history->id}/media", [
                'photo' => UploadedFile::fake()->image('after.jpg'),
                'photo_type' => HistoryMediaType::After,
            ]);

        $response->assertCreated();
        $media = $history->media()->sole();
        expect($media->photo_path)->toStartWith("history-media/{$history->id}/");
        Storage::disk('local')->assertExists($media->photo_path);

        $url = $response->json('data.photo_url');
        expect($url)->toContain('signature=')->toContain('expires=');
        $this->get($url)->assertOk();
    });

    it('rejects a non-image upload with 422', function () {
        $client = ClientModel::factory()->create();
        $history = historyForClientAndBarber($client);

        $this->actingAs($client, 'client')
            ->postJson("/api/v1/client/history/{$history->id}/media", [
                'photo' => UploadedFile::fake()->create('note.txt', 10),
                'photo_type' => HistoryMediaType::After,
            ])
            ->assertStatus(422);
    });
});

describe('GET /barber/clients/{client}/history', function () {
    it('allows a barber with a qualifying booking', function () {
        $barber = BarberModel::factory()->create();
        $client = ClientModel::factory()->create();
        historyForClientAndBarber($client, $barber);
        BookingModel::factory()->create([
            'client_id' => $client->id,
            'barber_id' => $barber->id,
            'booking_status' => BookingStatus::Completed,
        ]);

        $this->actingAs($barber, 'barber')
            ->getJson("/api/v1/barber/clients/{$client->id}/history")
            ->assertOk();
    });

    it('allows a barber whose relationship is only via the chair', function () {
        $barber = BarberModel::factory()->create();
        $client = ClientModel::factory()->create();
        $chair = ChairModel::factory()->create(['barber_id' => $barber->id]);
        BookingModel::factory()->create([
            'client_id' => $client->id,
            'barber_id' => null,
            'chair_id' => $chair->id,
            'booking_status' => BookingStatus::Confirmed,
        ]);

        $this->actingAs($barber, 'barber')
            ->getJson("/api/v1/barber/clients/{$client->id}/history")
            ->assertOk();
    });

    it('forbids a barber with no booking with the client', function () {
        $barber = BarberModel::factory()->create();
        $client = ClientModel::factory()->create();

        $this->actingAs($barber, 'barber')
            ->getJson("/api/v1/barber/clients/{$client->id}/history")
            ->assertForbidden();
    });

    it('forbids a barber whose only booking with the client was cancelled', function () {
        $barber = BarberModel::factory()->create();
        $client = ClientModel::factory()->create();
        BookingModel::factory()->create([
            'client_id' => $client->id,
            'barber_id' => $barber->id,
            'booking_status' => BookingStatus::Cancelled,
        ]);

        $this->actingAs($barber, 'barber')
            ->getJson("/api/v1/barber/clients/{$client->id}/history")
            ->assertForbidden();
    });
});
