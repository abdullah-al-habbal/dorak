<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;

/** The shared service payload plus the category the dashboard groups by: the service's own category, else its catalog item's. */
final class DashboardServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $category = $this->resource->category ?? $this->resource->catalogItem?->category;

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
