<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Resources\Shared;

use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Brand\Services\BrandFeatures;

final class BrandResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->getTranslations('name'),
            'description' => $this->getTranslations('description'),
            'logo_url' => $this->logo_url,
            'owner' => $this->whenLoaded('owner', fn () => [
                'id' => $this->owner->id,
                'email' => $this->owner->email,
            ]),
            'base_currency' => $this->whenLoaded('baseCurrency', fn () => [
                'id' => $this->baseCurrency->id,
                'code' => $this->baseCurrency->code,
            ]),
            'slug' => $this->offsetGet('slug'),
            'universe' => $this->offsetGet('universe'),
            'status' => $this->offsetGet('status'),
            'branches_count' => $this->offsetGet('branches_count') !== null
                ? (int) $this->offsetGet('branches_count')
                : $this->whenLoaded('branches', fn () => $this->branches->count()),
            'features' => app(BrandFeatures::class)->all($this->resource),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
