<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

#[Signature('face-profile:purge')]
#[Description('Delete face profile photos of clients soft-deleted more than 30 days ago (FACE-3)')]
final class PurgeFaceProfilePhotosCommand extends Command
{
    public function handle(): int
    {
        $clientIds = ClientModel::onlyTrashed()
            ->where('deleted_at', '<=', now()->subDays(app(SettingsService::class)->int(SettingKey::FaceProfileRetentionDays)))
            ->pluck('id');

        $purged = 0;

        ClientFaceProfileModel::query()
            ->whereIn('client_id', $clientIds)
            ->chunkById(100, function ($photos) use (&$purged): void {
                foreach ($photos as $photo) {
                    if ($photo->image_path !== null) {
                        Storage::disk('local')->delete($photo->image_path);
                    }
                    $photo->delete();
                    $purged++;
                }
            });

        $this->info("Purged {$purged} face profile photo(s) for clients deleted over ".app(SettingsService::class)->int(SettingKey::FaceProfileRetentionDays).' days ago.');

        return self::SUCCESS;
    }
}
