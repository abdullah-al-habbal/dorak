<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Eloquent\Resolvers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Modules\ClientFaceProfile\CQRS\Command\DeleteFaceProfilePhotoCommand;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;

final class DeleteFaceProfilePhotoEloquentResolver
{
    public function resolve(DeleteFaceProfilePhotoCommand $command): void
    {
        DB::transaction(function () use ($command): void {
            $profile = ClientFaceProfileModel::query()->lockForUpdate()->findOrFail($command->profileId);
            $clientId = $profile->client_id;
            $wasPrimary = $profile->is_primary;
            $imagePath = $profile->image_path;

            $profile->delete();

            if ($wasPrimary) {
                ClientFaceProfileModel::query()
                    ->where('client_id', $clientId)
                    ->oldest('uploaded_at')
                    ->first()
                    ?->update(['is_primary' => true]);
            }

            if ($imagePath !== null) {
                Storage::disk('local')->delete($imagePath);
            }
        });
    }
}
