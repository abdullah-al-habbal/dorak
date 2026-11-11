<?php

declare(strict_types=1);

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

beforeEach(function () {
    $this->client = ClientModel::factory()->create();
    Queue::fake();
    Storage::fake('local');
});

function uploadFacePhoto(ClientModel $client, bool $isPrimary = false)
{
    return test()->actingAs($client, 'client')
        ->postJson('/api/v1/client/face-profile', [
            'photo' => UploadedFile::fake()->image('face.jpg', 400, 400),
            'is_primary' => $isPrimary,
        ]);
}

it('rejects a 6th photo with 422 face_photo_limit_reached and keeps the row count at 5', function () {
    for ($i = 0; $i < app(SettingsService::class)->int(SettingKey::FaceProfileMaxPhotos); $i++) {
        uploadFacePhoto($this->client)->assertCreated();
    }

    $response = uploadFacePhoto($this->client);

    $response->assertStatus(422)->assertJsonPath('code', 'face_photo_limit_reached');
    expect(ClientFaceProfileModel::query()->where('client_id', $this->client->id)->count())->toBe(app(SettingsService::class)->int(SettingKey::FaceProfileMaxPhotos));
});

it('leaves exactly one primary row when uploading with is_primary true', function () {
    uploadFacePhoto($this->client, true)->assertCreated();
    uploadFacePhoto($this->client, true)->assertCreated();
    uploadFacePhoto($this->client, false)->assertCreated();

    expect(ClientFaceProfileModel::query()->where('client_id', $this->client->id)->where('is_primary', true)->count())->toBe(1);
});

it('makes the first photo primary automatically even without is_primary', function () {
    uploadFacePhoto($this->client, false)->assertCreated();

    expect(ClientFaceProfileModel::query()->where('client_id', $this->client->id)->first()->is_primary)->toBeTrue();
});

it('lets the owner delete a photo, removes the file, and reassigns primary', function () {
    $first = uploadFacePhoto($this->client, true)->json('data.id');
    $second = uploadFacePhoto($this->client, false)->json('data.id');

    $firstPath = ClientFaceProfileModel::query()->findOrFail($first)->image_path;

    $this->actingAs($this->client, 'client')
        ->deleteJson("/api/v1/client/face-profile/{$first}")
        ->assertOk();

    expect(ClientFaceProfileModel::query()->find($first))->toBeNull();
    Storage::disk('local')->assertMissing($firstPath);
    expect(ClientFaceProfileModel::query()->findOrFail($second)->is_primary)->toBeTrue();
});

it('forbids another client from deleting a photo', function () {
    $photoId = uploadFacePhoto($this->client)->json('data.id');
    $other = ClientModel::factory()->create();

    $this->actingAs($other, 'client')
        ->deleteJson("/api/v1/client/face-profile/{$photoId}")
        ->assertForbidden();
});

it('sets a photo as primary and unsets the previous one', function () {
    $first = uploadFacePhoto($this->client, true)->json('data.id');
    $second = uploadFacePhoto($this->client, false)->json('data.id');

    $this->actingAs($this->client, 'client')
        ->patchJson("/api/v1/client/face-profile/{$second}/primary")
        ->assertOk()
        ->assertJsonPath('data.is_primary', true);

    expect(ClientFaceProfileModel::query()->findOrFail($first)->is_primary)->toBeFalse();
    expect(ClientFaceProfileModel::query()->findOrFail($second)->is_primary)->toBeTrue();
});

it('lists the owning clients photos only', function () {
    uploadFacePhoto($this->client)->assertCreated();
    uploadFacePhoto(ClientModel::factory()->create())->assertCreated();

    $response = $this->actingAs($this->client, 'client')
        ->getJson('/api/v1/client/face-profile');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
});

it('purges photos of clients soft-deleted more than 30 days ago and keeps recent ones', function () {
    $oldClient = ClientModel::factory()->create();
    $recentClient = ClientModel::factory()->create();

    $oldPhotoId = uploadFacePhoto($oldClient)->json('data.id');
    $recentPhotoId = uploadFacePhoto($recentClient)->json('data.id');
    $oldPath = ClientFaceProfileModel::query()->findOrFail($oldPhotoId)->image_path;

    $oldClient->delete();
    $oldClient->forceFill(['deleted_at' => now()->subDays(31)])->save();
    $recentClient->delete();
    $recentClient->forceFill(['deleted_at' => now()->subDays(10)])->save();

    $this->artisan('face-profile:purge')->assertSuccessful();

    expect(ClientFaceProfileModel::query()->find($oldPhotoId))->toBeNull();
    Storage::disk('local')->assertMissing($oldPath);
    expect(ClientFaceProfileModel::query()->find($recentPhotoId))->not->toBeNull();
});

it('registers the purge command in the scheduler', function () {
    $events = collect(app(Schedule::class)->events())
        ->filter(fn ($event) => str_contains((string) $event->command, 'face-profile:purge'));

    expect($events)->not->toBeEmpty();
});

it('forbids another client from setting a photo as primary', function () {
    uploadFacePhoto($this->client, true);
    $second = uploadFacePhoto($this->client, false)->json('data.id');

    $this->actingAs(ClientModel::factory()->create(), 'client')
        ->patchJson("/api/v1/client/face-profile/{$second}/primary")
        ->assertForbidden();

    expect(ClientFaceProfileModel::query()->findOrFail($second)->is_primary)->toBeFalse();
});
