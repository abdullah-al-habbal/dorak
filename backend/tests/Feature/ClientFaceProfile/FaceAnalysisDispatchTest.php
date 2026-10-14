<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Ai\FaceShapeAnalyzerAgent;
use Modules\ClientFaceProfile\Enums\FaceAnalysisStatusEnum;
use Modules\ClientFaceProfile\Jobs\AnalyzeFacePhotoJob;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('public');
    $this->client = ClientModel::factory()->create();
});

it('dispatches analysis job on photo upload with queue fake', function () {
    Queue::fake();

    $file = UploadedFile::fake()->image('face.jpg', 400, 400);

    $response = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/face-profile', [
            'photo' => $file,
            'is_primary' => true,
        ]);

    $response->assertCreated();
    $profileId = $response->json('data.id');
    expect($profileId)->not->toBeNull();
    expect($response->json('data.analysis_status'))->toBe('pending');

    $profile = ClientFaceProfileModel::query()->findOrFail($profileId);
    expect($profile->analysis_status)->toBe(FaceAnalysisStatusEnum::Pending);

    Queue::assertPushed(AnalyzeFacePhotoJob::class, function (AnalyzeFacePhotoJob $job) use ($profileId) {
        $reflection = new ReflectionClass($job);
        $faceProfileId = $reflection->getProperty('faceProfileId');
        $faceProfileId->setAccessible(true);
        $clientId = $reflection->getProperty('clientId');
        $clientId->setAccessible(true);

        return $faceProfileId->getValue($job) === $profileId && $clientId->getValue($job) === (string) $this->client->id;
    });
    Queue::assertPushedTimes(AnalyzeFacePhotoJob::class, 1);
});

it('running job stores result and recommendations become non-empty', function () {
    $file = UploadedFile::fake()->image('face.jpg', 400, 400);
    $path = $file->store("face-profiles/{$this->client->id}", 'local');

    $profile = ClientFaceProfileModel::create([
        'client_id' => $this->client->id,
        'image_path' => $path,
        'image_hash' => md5($file->get()),
        'is_primary' => true,
        'analysis_status' => 'pending',
        'uploaded_at' => now(),
    ]);

    $matchedItem = ServiceCatalogItemModel::factory()->create([
        'is_active' => true,
        'face_shapes' => ['oval'],
    ]);
    ServiceCatalogItemModel::factory()->create([
        'is_active' => true,
        'face_shapes' => ['round'],
    ]);

    FaceShapeAnalyzerAgent::fake([
        [
            'face_shape' => 'oval',
            'confidence' => 0.91,
            'features' => [
                'forehead_width' => 110,
                'jaw_angle' => 75,
                'cheekbone_prominence' => 'medium',
            ],
        ],
    ]);

    AnalyzeFacePhotoJob::dispatchSync($profile->id, $this->client->id);

    expect($profile->fresh()->analysis_status)->toBe(FaceAnalysisStatusEnum::Completed);

    $response = $this->actingAs($this->client, 'client')
        ->getJson('/api/v1/client/face-profile/recommendations');

    $response->assertOk();
    expect($response->json('data'))->toBeArray()->not->toBeEmpty();
});

it('job failure sets analysis status to failed and upload still succeeds', function () {
    Queue::fake();

    $file = UploadedFile::fake()->image('face.jpg', 400, 400);

    $response = $this->actingAs($this->client, 'client')
        ->postJson('/api/v1/client/face-profile', [
            'photo' => $file,
            'is_primary' => true,
        ]);

    $response->assertCreated();
    $profileId = $response->json('data.id');
    expect($profileId)->not->toBeNull();
    expect($response->json('data.analysis_status'))->toBe('pending');

    $profile = ClientFaceProfileModel::query()->findOrFail($profileId);
    expect($profile->analysis_status)->toBe(FaceAnalysisStatusEnum::Pending);

    (new AnalyzeFacePhotoJob((string) $profile->id, (string) $this->client->id))
        ->failed(new RuntimeException('Analyzer unavailable.'));

    expect($profile->fresh()->analysis_status)->toBe(FaceAnalysisStatusEnum::Failed);
    $this->actingAs($this->client, 'client')
        ->getJson("/api/v1/client/face-profile/{$profileId}")
        ->assertOk()
        ->assertJsonPath('data.analysis_status', 'failed');
    Queue::assertPushed(AnalyzeFacePhotoJob::class, 1);
});
