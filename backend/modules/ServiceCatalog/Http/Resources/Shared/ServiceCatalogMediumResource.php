<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Modules\ServiceCatalog\Models\ServiceCatalogMediumModel;

/** @mixin ServiceCatalogMediumModel */
final class ServiceCatalogMediumResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'media_type' => $this->media_type->value,
            'image_path' => $this->image_path,
            'image_url' => Storage::disk('public')->url($this->image_path),
            'alt_text' => $this->alt_text,
            'sort_order' => $this->sort_order,
        ];
    }
}
