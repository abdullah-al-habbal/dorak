<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\ServiceCatalog\Support\CatalogCategoryUsage;

/** Admin catalog row: the shared category fields plus usage counts (admin routes only). */
final class AdminCatalogCategoryResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->getTranslations('name'),
            'description' => $this->resource->getTranslations('description'),
            'slug' => $this->resource->slug,
            'parent_id' => $this->resource->parent_id,
            'universe' => $this->resource->universe,
            'is_active' => $this->resource->is_active,
            'sort_order' => $this->resource->sort_order,
            'items_count' => (int) $this->resource->items_count,
            'children_count' => (int) $this->resource->children_count,
            'services_count' => (int) $this->resource->getAttribute(CatalogCategoryUsage::SERVICES_COUNT),
            'children' => self::collection($this->whenLoaded('children')),
            'created_at' => $this->resource->created_at?->toIso8601String(),
        ];
    }
}
