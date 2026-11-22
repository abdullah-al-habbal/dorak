<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `/branches/{slug}`: what a visitor may see of a discoverable branch. Unlike the app's branch detail it
 * carries no login email and no internal ids; the `services`, `opening_hours` and `today_hours` come from the resolver.
 */
final class PublicBranchProfileResource extends JsonResource
{
    /** @param array{stylists: mixed, services: mixed, opening_hours: array<int, mixed>, today_hours: ?array<string, mixed>} $extra */
    public function __construct($resource, private readonly array $extra)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->offsetGet('slug'),
            'name' => $this->getTranslations('name'),
            'description' => $this->getTranslations('description'),
            'address' => $this->getTranslations('address'),
            'tags' => $this->tagTranslations(),
            'universe' => $this->offsetGet('universe'),
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'rating_average' => $this->offsetGet('rating_average') === null ? null : (float) $this->offsetGet('rating_average'),
            'rating_count' => (int) ($this->offsetGet('rating_count') ?? 0),
            'brand' => $this->brand === null ? null : PublicBrandSummaryResource::make($this->brand),
            'stylists' => PublicStylistSummaryResource::collection($this->extra['stylists']),
            'services' => PublicServiceResource::collection($this->extra['services']),
            'opening_hours' => $this->extra['opening_hours'],
            'today_hours' => $this->extra['today_hours'],
        ];
    }
}
