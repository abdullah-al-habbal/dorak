<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\ClientFaceProfile\Services\FaceProfilePhotoUrl;

/** @mixin ClientFaceProfileModel */
final class ClientFaceProfileResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'image_url' => FaceProfilePhotoUrl::forId($this->id),
            'is_primary' => $this->is_primary,
            'uploaded_at' => $this->uploaded_at->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
