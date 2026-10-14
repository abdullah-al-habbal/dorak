<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Handlers;

use Illuminate\Support\Facades\Log;
use Modules\ClientFaceProfile\CQRS\Command\RequestFaceAnalysisCommand;
use Modules\ClientFaceProfile\CQRS\Command\UploadFaceProfilePhotoCommand;
use Modules\ClientFaceProfile\Eloquent\Resolvers\UploadFaceProfilePhotoEloquentResolver;
use Modules\ClientFaceProfile\Enums\FaceAnalysisStatusEnum;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Throwable;

final class UploadFaceProfilePhotoHandler
{
    public function __construct(
        private readonly UploadFaceProfilePhotoEloquentResolver $resolver,
        private readonly RequestFaceAnalysisHandler $requestFaceAnalysisHandler,
    ) {}

    public function handle(UploadFaceProfilePhotoCommand $command): ClientFaceProfileModel
    {
        $profile = $this->resolver->resolve($command);

        try {
            $this->requestFaceAnalysisHandler->handle(new RequestFaceAnalysisCommand(
                faceProfileId: (string) $profile->id,
                clientId: $command->clientId,
            ));
        } catch (Throwable $exception) {
            $profile->update(['analysis_status' => FaceAnalysisStatusEnum::Failed]);
            Log::error('Face analysis job could not be dispatched.', [
                'face_profile_id' => $profile->id,
                'client_id' => $command->clientId,
                'exception' => $exception,
            ]);
        }

        return $profile;
    }
}
