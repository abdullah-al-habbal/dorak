<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Resources\Client;

use Illuminate\Http\Resources\Json\JsonResource;
use Modules\ClientFaceProfile\Models\ClientFaceAnalysisResultModel;
use Modules\ClientFaceProfile\Services\FaceProfilePhotoUrl;

/** @mixin ClientFaceAnalysisResultModel */
final class ClientFaceAnalysisResultResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'face_profile_id' => $this->face_profile_id,
            'analysis_version' => $this->analysis_version,
            'analysis_source' => $this->analysis_source->value,
            'detected_face_shape' => $this->detected_face_shape->value,
            'confidence_ratio' => $this->confidence_ratio,
            'detected_features' => $this->detected_features?->toArray(),
            'recommended_catalog_item_ids' => $this->recommended_catalog_item_ids?->ids(),
            'computed_at' => $this->computed_at->toIso8601String(),
            'face_profile' => $this->whenLoaded('faceProfile', fn () => $this->faceProfile === null ? null : [
                'id' => $this->faceProfile->id,
                'image_url' => FaceProfilePhotoUrl::forId($this->faceProfile->id),
            ]),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
