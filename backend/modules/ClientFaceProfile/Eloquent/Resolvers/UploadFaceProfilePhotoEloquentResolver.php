<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Eloquent\Resolvers;

use Modules\ClientFaceProfile\CQRS\Command\UploadFaceProfilePhotoCommand;
use Modules\ClientFaceProfile\Enums\FaceAnalysisStatusEnum;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;

final class UploadFaceProfilePhotoEloquentResolver
{
    public function resolve(UploadFaceProfilePhotoCommand $command): ClientFaceProfileModel
    {
        return ClientFaceProfileModel::create([
            'client_id' => $command->clientId,
            'image_path' => $command->imagePath,
            'image_hash' => $command->imageHash,
            'is_primary' => $command->isPrimary,
            'analysis_status' => FaceAnalysisStatusEnum::Pending,
            'uploaded_at' => now(),
        ]);
    }
}
