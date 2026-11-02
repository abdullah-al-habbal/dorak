<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Resources\Shared;

use Illuminate\Http\Resources\Json\JsonResource;

final class ServiceCatalogItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->getTranslations('name'),
            'description' => $this->getTranslations('description'),
            'slug' => $this->slug,
            'sku' => $this->sku,
            'price_range' => $this->price_range?->toArray(),
            'maintenance_level' => $this->maintenance_level,
            'style_period_type' => $this->style_period_type,
            'formality_level' => $this->formalityLevel,
            'face_shapes' => $this->face_shapes,
            'hair_textures' => $this->hair_textures,
            'styling_details' => $this->styling_details?->toArray(),
            'default_duration_minutes' => $this->default_duration_minutes,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->getTranslations('name'),
                'slug' => $this->category->slug,
            ]),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($tag) => [
                'id' => $tag->id,
                'name' => $tag->getTranslations('name'),
                'slug' => $tag->slug,
                'group_name' => $tag->group_name,
            ])),
            'media' => $this->whenLoaded('media', fn () => $this->media->map(fn ($medium) => [
                'id' => $medium->id,
                'media_type' => $medium->media_type->value,
                'image_path' => $medium->image_path,
                'alt_text' => $medium->alt_text,
                'sort_order' => $medium->sort_order,
            ])),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
