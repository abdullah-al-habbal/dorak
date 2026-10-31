<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Eloquent\Resolvers;

use Illuminate\Support\Facades\DB;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Constants\FaceProfilePhotoConstants;
use Modules\ClientFaceProfile\CQRS\Command\UploadFaceProfilePhotoCommand;
use Modules\ClientFaceProfile\Enums\FaceAnalysisStatusEnum;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;

final class UploadFaceProfilePhotoEloquentResolver
{
    public function resolve(UploadFaceProfilePhotoCommand $command): ClientFaceProfileModel
    {
        return DB::transaction(function () use ($command): ClientFaceProfileModel {
            ClientModel::query()->lockForUpdate()->findOrFail($command->clientId);

            $existing = ClientFaceProfileModel::query()
                ->where('client_id', $command->clientId)
                ->lockForUpdate()
                ->count();

            if ($existing >= FaceProfilePhotoConstants::FACE_PROFILE_PHOTO_MAX_PHOTOS_PER_CLIENT) {
                throw new FacePhotoLimitReachedException;
            }

            $isPrimary = $command->isPrimary || $existing === 0;

            if ($isPrimary) {
                ClientFaceProfileModel::query()
                    ->where('client_id', $command->clientId)
                    ->update(['is_primary' => false]);
            }

            return ClientFaceProfileModel::create([
                'client_id' => $command->clientId,
                'image_path' => $command->imagePath,
                'image_hash' => $command->imageHash,
                'is_primary' => $isPrimary,
                'analysis_status' => FaceAnalysisStatusEnum::Pending,
                'uploaded_at' => now(),
            ]);
        });
    }
}
