<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;

#[Signature('face-profile:purge')]
#[Description('Delete face profile photos of clients soft-deleted more than 30 days ago (FACE-3)')]
final class PurgeFaceProfilePhotosCommand extends Command
{
    public const RETENTION_DAYS = 30;

    public function handle(): int
    {
        $clientIds = ClientModel::onlyTrashed()
            ->where('deleted_at', '<=', now()->subDays(self::RETENTION_DAYS))
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

        $this->info("Purged {$purged} face profile photo(s) for clients deleted over ".self::RETENTION_DAYS.' days ago.');

        return self::SUCCESS;
    }
}
