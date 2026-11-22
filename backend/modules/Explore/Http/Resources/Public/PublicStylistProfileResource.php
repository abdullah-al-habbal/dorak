<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * `/stylists/{slug}`: what a visitor may see of a discoverable stylist. No phone, email, id or
 * coordinates (a freelancer's location is private); `workplaces` and `services` come from the resolver.
 */
final class PublicStylistProfileResource extends JsonResource
{
    /** @param array{services: mixed, workplaces: list<array<string, mixed>>} $extra */
    public function __construct($resource, private readonly array $extra)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->offsetGet('slug'),
            'name' => $this->getTranslations('name'),
            'bio' => $this->getTranslations('bio'),
            'is_freelancer' => (bool) $this->offsetGet('is_freelancer'),
            'universe' => $this->offsetGet('universe'),
            'rating_average' => $this->offsetGet('rating_average') === null ? null : (float) $this->offsetGet('rating_average'),
            'rating_count' => (int) ($this->offsetGet('rating_count') ?? 0),
            'portfolio' => $this->portfolioPhotos
                ->map(fn ($photo): array => ['url' => Storage::disk('public')->url($photo->image_path)])
                ->values()
                ->all(),
            'services' => PublicServiceResource::collection($this->extra['services']),
            'workplaces' => $this->extra['workplaces'],
        ];
    }
}
