<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;

/** The shared service payload plus the catalog category the dashboard groups by. */
final class DashboardServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $category = $this->resource->relationLoaded('catalogItem') ? $this->resource->catalogItem?->category : null;

        return [
            ...(new ServiceResource($this->resource))->toArray($request),
            'name_translations' => $this->resource->getTranslations('name'),
            'category' => $category === null ? null : [
                'id' => $category->id,
                'name' => $category->getTranslations('name'),
            ],
        ];
    }
}
