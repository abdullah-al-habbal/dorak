<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('public');
    $this->client = ClientModel::factory()->create();
});

it('stores uploaded photos privately and returns a short-lived signed URL', function () {
    $response = $this->actingAs($this->client, 'client')->postJson('/api/v1/client/face-profile', [
        'photo' => UploadedFile::fake()->image('face.jpg'),
    ]);

    $response->assertCreated();
    $profile = ClientFaceProfileModel::query()->findOrFail($response->json('data.id'));
    expect($profile->image_path)->toStartWith("face-profiles/{$this->client->id}/");
    Storage::disk('local')->assertExists($profile->image_path);
    Storage::disk('public')->assertMissing($profile->image_path);
    expect($profile->getAttributes())->not->toHaveKey('image_url');

    $url = $response->json('data.image_url');
    expect($url)->toContain('signature=')->toContain('expires=');
    $this->get($url)->assertOk();
});

it('rejects missing and expired photo signatures', function () {
    $profile = ClientFaceProfileModel::create([
        'client_id' => $this->client->id,
        'image_path' => 'face-profiles/private.jpg',
        'image_hash' => 'hash',
        'is_primary' => true,
        'uploaded_at' => now(),
    ]);
    Storage::disk('local')->put($profile->image_path, 'image-bytes');

    $this->getJson("/api/v1/client/face-profile/{$profile->id}/photo")->assertForbidden();

    $signedUrl = URL::temporarySignedRoute(
        'api.v1.client.face-profile.photo',
        now()->addMinute(),
        ['profile' => $profile->id],
    );
    $this->travel(2)->minutes();
    $this->get($signedUrl)->assertForbidden();
});

it('rejects a signed URL when another client profile is substituted', function () {
    $otherClient = ClientModel::factory()->create();
    $otherProfile = ClientFaceProfileModel::create([
        'client_id' => $otherClient->id,
        'image_path' => 'face-profiles/other/private.jpg',
        'image_hash' => 'hash',
        'is_primary' => true,
        'uploaded_at' => now(),
    ]);
    $ownedProfile = ClientFaceProfileModel::create([
        'client_id' => $this->client->id,
        'image_path' => 'face-profiles/owned/private.jpg',
        'image_hash' => 'hash',
        'is_primary' => true,
        'uploaded_at' => now(),
    ]);
    $signedUrl = URL::temporarySignedRoute(
        'api.v1.client.face-profile.photo',
        now()->addMinute(),
        ['profile' => $ownedProfile->id],
    );

    $this->get(str_replace($ownedProfile->id, $otherProfile->id, $signedUrl))->assertForbidden();

    $otherClientSignedUrl = URL::temporarySignedRoute(
        'api.v1.client.face-profile.photo',
        now()->addMinute(),
        ['profile' => $otherProfile->id],
    );
    $this->actingAs($this->client, 'client')->get($otherClientSignedUrl)->assertForbidden();
});

it('requires authentication before issuing a photo URL', function () {
    $this->postJson('/api/v1/client/face-profile', [
        'photo' => UploadedFile::fake()->image('face.jpg'),
    ])->assertUnauthorized();
});

it('moves legacy public files to private storage and removes public copies', function () {
    $profile = ClientFaceProfileModel::create([
        'client_id' => $this->client->id,
        'image_path' => 'face-profiles/legacy.jpg',
        'image_hash' => 'hash',
        'is_primary' => true,
        'uploaded_at' => now(),
    ]);
    Storage::disk('local')->put($profile->image_path, 'legacy-image-bytes');

    $migration = require base_path('modules/ClientFaceProfile/Database/Migrations/2026_10_12_000001_move_client_face_photos_to_private_storage.php');
    $migration->down();

    $legacyUrlPath = parse_url($profile->fresh()->image_url, PHP_URL_PATH);
    $legacyPath = (string) preg_replace('#^/storage/#', '', $legacyUrlPath);
    Storage::disk('public')->assertExists($legacyPath);

    $migration->up();

    $profile->refresh();
    expect($profile->image_path)->toBe("face-profiles/{$this->client->id}/legacy.jpg");
    Storage::disk('local')->assertExists($profile->image_path);
    Storage::disk('public')->assertMissing($legacyPath);
});
