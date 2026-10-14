<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Modules\Client\Models\ClientModel;

beforeEach(function () {
    $this->client = ClientModel::factory()->create();
    Queue::fake();
    Storage::fake('local');
});

it('uploads face photo and returns profile', function () {
    $file = UploadedFile::fake()->image('face.jpg', 400, 400);

    $response = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/face-profile', [
            'photo' => $file,
            'is_primary' => true,
        ]);

    $response->assertCreated();
    expect($response->json('data'))->toHaveKeys(['id', 'image_url', 'is_primary', 'uploaded_at']);
    expect($response->json('data.is_primary'))->toBeTrue();
});

it('uploads multiple photos', function () {
    $file1 = UploadedFile::fake()->image('face1.jpg', 400, 400);
    $file2 = UploadedFile::fake()->image('face2.jpg', 400, 400);

    $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/face-profile', ['photo' => $file1, 'is_primary' => true]);

    $response = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/face-profile', ['photo' => $file2, 'is_primary' => false]);

    $response->assertCreated();
});

it('returns 422 without photo', function () {
    $response = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/face-profile', []);

    $response->assertStatus(422);
});

it('returns 401 without auth for upload', function () {
    $response = $this->postJson('/api/v1/client/face-profile', []);

    $response->assertUnauthorized();
});

it('returns recommendations list', function () {
    $response = $this->actingAs($this->client, 'client')
        ->getJson('/api/v1/client/face-profile/recommendations');

    $response->assertOk();
    expect($response->json('data'))->toBeArray();
});

it('returns the authenticated client face profile analysis status', function () {
    $upload = UploadedFile::fake()->image('face.jpg', 400, 400);
    $response = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/face-profile', ['photo' => $upload]);
    $response->assertCreated();

    $profileId = $response->json('data.id');
    $this->actingAs($this->client, 'client')
        ->getJson("/api/v1/client/face-profile/{$profileId}")
        ->assertOk()
        ->assertJsonPath('data.analysis_status', 'pending');
});

it('does not expose another clients face profile status', function () {
    $upload = UploadedFile::fake()->image('face.jpg', 400, 400);
    $profileId = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/face-profile', ['photo' => $upload])
        ->json('data.id');

    $otherClient = ClientModel::factory()->create();
    $this->actingAs($otherClient, 'client')
        ->getJson("/api/v1/client/face-profile/{$profileId}")
        ->assertNotFound();
});

it('returns 401 without auth for recommendations', function () {
    $response = $this->getJson('/api/v1/client/face-profile/recommendations');

    $response->assertUnauthorized();
});
