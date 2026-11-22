<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** A branch as a link card on a public page: no login email, no floor plan, no status. */
final class PublicBranchSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->offsetGet('slug'),
            'name' => $this->getTranslations('name'),
            'address' => $this->getTranslations('address'),
            'rating_average' => $this->offsetGet('rating_average') === null ? null : (float) $this->offsetGet('rating_average'),
            'rating_count' => (int) ($this->offsetGet('rating_count') ?? 0),
        ];
    }
}
