<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Marketing\Models\MarketingPageModel;

/** @mixin MarketingPageModel */
final class AdminMarketingPageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->getTranslations('title'),
            'meta_description' => $this->getTranslations('meta_description'),
            'published_at' => $this->published_at?->toIso8601String(),
            'sections' => AdminSectionResource::collection($this->whenLoaded('sections')),
        ];
    }
}
