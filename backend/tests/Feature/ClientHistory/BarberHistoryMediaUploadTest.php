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

function barberHistoryFor(BarberModel $barber): ClientServiceHistoryModel
{
    $service = OfferedServiceModel::factory()->create([
        'serviceable_id' => $barber->id,
        'serviceable_type' => ServiceableTypeEnum::Barber,
    ]);

    return ClientServiceHistoryModel::query()->create([
        'client_id' => ClientModel::factory()->create()->id,
        'barber_id' => $barber->id,
        'offered_service_id' => $service->id,
        'performed_at' => now()->subDay(),
    ]);
}

describe('POST /barber/history/{history}/media', function (): void {
    it('lets the assigned barber attach tagged media', function (HistoryMediaType $type): void {
        $barber = BarberModel::factory()->create();
        $history = barberHistoryFor($barber);

        $response = $this->actingAs($barber, 'barber')
            ->postJson("/api/v1/barber/history/{$history->id}/media", [
                'photo' => UploadedFile::fake()->image('visit.jpg'),
                'photo_type' => $type->value,
            ])
            ->assertCreated();

        expect($response->json('data.photo_type'))->toBe($type->value)
            ->and($response->json('data.photo_url'))->not->toBeNull();
        $this->assertDatabaseHas('client_service_history_media', [
            'client_service_history_id' => $history->id,
            'photo_type' => $type->value,
        ]);
    })->with([HistoryMediaType::Before, HistoryMediaType::After, HistoryMediaType::Reference]);

    it('forbids a barber who is not assigned to the visit', function (): void {
        $history = barberHistoryFor(BarberModel::factory()->create());

        $this->actingAs(BarberModel::factory()->create(), 'barber')
            ->postJson("/api/v1/barber/history/{$history->id}/media", [
                'photo' => UploadedFile::fake()->image('visit.jpg'),
                'photo_type' => HistoryMediaType::Before->value,
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('client_service_history_media', 0);
    });

    it('rejects clients on the barber route', function (): void {
        $history = barberHistoryFor(BarberModel::factory()->create());

        $this->actingAs(ClientModel::factory()->create(), 'client')
            ->postJson("/api/v1/barber/history/{$history->id}/media", [
                'photo' => UploadedFile::fake()->image('visit.jpg'),
                'photo_type' => HistoryMediaType::Before->value,
            ])
            ->assertUnauthorized();
    });

    it('requires authentication', function (): void {
        $history = barberHistoryFor(BarberModel::factory()->create());

        $this->postJson("/api/v1/barber/history/{$history->id}/media")->assertUnauthorized();
    });

    it('returns not found for a missing history record', function (): void {
        $this->actingAs(BarberModel::factory()->create(), 'barber')
            ->postJson('/api/v1/barber/history/missing/media', [
                'photo' => UploadedFile::fake()->image('visit.jpg'),
                'photo_type' => HistoryMediaType::Before->value,
            ])
            ->assertNotFound();
    });

    it('validates the file and tag', function (array $payload): void {
        $barber = BarberModel::factory()->create();
        $history = barberHistoryFor($barber);

        $this->actingAs($barber, 'barber')
            ->postJson("/api/v1/barber/history/{$history->id}/media", $payload)
            ->assertUnprocessable();

        $this->assertDatabaseCount('client_service_history_media', 0);
    })->with([
        'missing photo' => [['photo_type' => 'before']],
        'missing type' => fn () => [['photo' => UploadedFile::fake()->image('a.jpg')]],
        'unknown type' => fn () => [['photo' => UploadedFile::fake()->image('a.jpg'), 'photo_type' => 'during']],
        'not an image' => fn () => [['photo' => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf'), 'photo_type' => 'before']],
        'too large' => fn () => [['photo' => UploadedFile::fake()->image('a.jpg')->size(6000), 'photo_type' => 'before']],
        'wrong extension' => fn () => [['photo' => UploadedFile::fake()->image('a.gif'), 'photo_type' => 'before']],
    ]);
});
