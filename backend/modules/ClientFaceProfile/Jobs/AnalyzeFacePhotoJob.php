<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Timeout;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Support\Facades\Log;
use Modules\ClientFaceProfile\CQRS\Command\StoreFaceAnalysisResultCommand;
use Modules\ClientFaceProfile\Enums\FaceAnalysisStatusEnum;
use Modules\ClientFaceProfile\Handlers\StoreFaceAnalysisResultHandler;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\ClientFaceProfile\Services\FaceAnalysisService;
use Modules\ClientFaceProfile\ValuesObjects\RecommendedCatalogItemIdsValueObject;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;
use Throwable;

#[Tries(3)]
#[Timeout(120)]
#[Backoff(10, 30, 60)]
class AnalyzeFacePhotoJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(
        private readonly string $faceProfileId,
        private readonly string $clientId,
    ) {}

    public function handle(
        StoreFaceAnalysisResultHandler $handler,
        FaceAnalysisService $analysisService,
    ): void {
        $profile = ClientFaceProfileModel::query()
            ->where('id', $this->faceProfileId)
            ->where('client_id', $this->clientId)
            ->first();

        if ($profile === null) {
            return;
        }

        $outcome = $analysisService->analyze($profile);

        $recommendedCatalogItemIds = ServiceCatalogItemModel::query()
            ->where('is_active', true)
            ->whereJsonContains('face_shapes', $outcome->detectedFaceShape->value)
            ->pluck('id')
            ->all();

        $command = new StoreFaceAnalysisResultCommand(
            clientId: $this->clientId,
            faceProfileId: $this->faceProfileId,
            analysisVersion: $outcome->analysisVersion,
            analysisSource: $outcome->analysisSource,
            detectedFaceShape: $outcome->detectedFaceShape,
            confidenceScore: $outcome->confidenceScore,
            detectedFeatures: $outcome->detectedFeatures,
            recommendedCatalogItemIds: RecommendedCatalogItemIdsValueObject::fromArray([
                'ids' => $recommendedCatalogItemIds,
            ]),
        );

        $handler->handle($command);

        $profile->update(['analysis_status' => FaceAnalysisStatusEnum::Completed]);
    }

    public function failed(Throwable $exception): void
    {
        $profile = ClientFaceProfileModel::query()
            ->where('id', $this->faceProfileId)
            ->where('client_id', $this->clientId)
            ->first();

        $profile?->update(['analysis_status' => FaceAnalysisStatusEnum::Failed]);

        Log::error('Face analysis job exhausted its retries.', [
            'face_profile_id' => $this->faceProfileId,
            'client_id' => $this->clientId,
            'exception' => $exception,
        ]);
    }
}
