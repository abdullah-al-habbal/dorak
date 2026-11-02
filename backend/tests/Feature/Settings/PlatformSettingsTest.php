<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Settings\Database\Seeders\PlatformSettingSeeder;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Models\PlatformSettingModel;
use Modules\Settings\Services\SettingsService;

describe('Platform settings', function (): void {
    it('falls back to the default when no row exists', function (): void {
        expect(app(SettingsService::class)->int(SettingKey::UploadPortfolioMaxKb))
            ->toBe(SettingKey::UploadPortfolioMaxKb->default());
    });

    it('seeds every setting once with its default', function (): void {
        $this->seed(PlatformSettingSeeder::class);
        $this->seed(PlatformSettingSeeder::class);

        expect(PlatformSettingModel::query()->count())->toBe(count(SettingKey::cases()));
    });

    it('lets an admin list and update settings, applying the new value immediately', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $key = SettingKey::FaceProfileMaxPhotos;

        $this->getJson('/api/v1/dashboard/admin/settings')
            ->assertOk()
            ->assertJsonFragment(['setting_key' => $key->value, 'value_integer' => $key->default(), 'default' => $key->default()]);

        $this->patchJson('/api/v1/dashboard/admin/settings', ['settings' => [$key->value => $key->max()]])
            ->assertOk()
            ->assertJsonPath('data.'.$key->value, $key->max());

        expect(app(SettingsService::class)->int($key))->toBe($key->max());
    });

    it('rejects out-of-range, non-integer and unknown-empty payloads', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $key = SettingKey::ClientPhoneOtpMaxAttempts;

        $this->patchJson('/api/v1/dashboard/admin/settings', ['settings' => [$key->value => $key->min() - 1]])->assertUnprocessable();
        $this->patchJson('/api/v1/dashboard/admin/settings', ['settings' => [$key->value => $key->max() + 1]])->assertUnprocessable();
        $this->patchJson('/api/v1/dashboard/admin/settings', ['settings' => [$key->value => 'many']])->assertUnprocessable();
        $this->patchJson('/api/v1/dashboard/admin/settings', ['settings' => []])->assertUnprocessable();
    });

    it('forbids non-admin actors', function (): void {
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->getJson('/api/v1/dashboard/admin/settings')->assertForbidden();
        $this->patchJson('/api/v1/dashboard/admin/settings', ['settings' => [SettingKey::ExploreCandidateCap->value => 100]])->assertForbidden();
    });
});
