<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BranchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'brand_id' => $this->brand_id,
            'description' => $this->localized('description'),
            'address' => $this->localized('address'),
            'tags' => $this->resource->localizedTags(app()->getLocale()),
            'universe' => $this->offsetGet('universe'),
            'rating_average' => $this->offsetGet('rating_average') === null ? null : (float) $this->offsetGet('rating_average'),
            'rating_count' => (int) ($this->offsetGet('rating_count') ?? 0),
            'distance' => $this->distance ?? null,
            'compatibility_score' => $this->compatibility_score ?? null,
            'rank' => $this->rank ?? null,
            'created_at' => $this->created_at,
        ];
    }

    private function localized(string $attribute): ?string
    {
        $value = $this->resource->getTranslation($attribute, app()->getLocale());

        return is_string($value) && $value !== '' ? $value : null;
    }
}
