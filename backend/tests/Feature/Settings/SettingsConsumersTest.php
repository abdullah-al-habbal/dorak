<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Modules\Admin\Models\AdminModel;
use Modules\Client\Models\ClientModel;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

describe('Settings drive runtime limits', function (): void {
    beforeEach(function (): void {
        Queue::fake();
        Storage::fake('local');
    });

    it('caps face photos per client at the configured value', function (): void {
        $client = ClientModel::factory()->create();
        app(SettingsService::class)->update([SettingKey::FaceProfileMaxPhotos->value => SettingKey::FaceProfileMaxPhotos->min()]);

        foreach (range(1, SettingKey::FaceProfileMaxPhotos->min()) as $_) {
            $this->actingAs($client, 'client')
                ->postJson('/api/v1/client/face-profile', ['photo' => UploadedFile::fake()->image('face.jpg', 400, 400)])
                ->assertCreated();
        }

        $this->actingAs($client, 'client')
            ->postJson('/api/v1/client/face-profile', ['photo' => UploadedFile::fake()->image('face.jpg', 400, 400)])
            ->assertStatus(422)
            ->assertJsonPath('code', 'face_photo_limit_reached');
    });

    it('rejects an upload larger than the configured size limit', function (): void {
        $client = ClientModel::factory()->create();
        $limit = SettingKey::UploadFacePhotoMaxKb->min();
        app(SettingsService::class)->update([SettingKey::UploadFacePhotoMaxKb->value => $limit]);

        $this->actingAs($client, 'client')
            ->postJson('/api/v1/client/face-profile', ['photo' => UploadedFile::fake()->image('face.jpg', 400, 400)->size($limit + 1)])
            ->assertStatus(422);
    });

    it('applies the configured maximum page size to admin lists', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $max = SettingKey::PaginationMaxPerPage->min();
        app(SettingsService::class)->update([SettingKey::PaginationMaxPerPage->value => $max]);

        $this->getJson('/api/v1/dashboard/admin/reviews?per_page='.($max + 1))->assertStatus(422);
        $this->getJson('/api/v1/dashboard/admin/reviews?per_page='.$max)->assertOk();
    });
});
