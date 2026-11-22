<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** `/brands/{slug}`: what a visitor may see of an active brand, with its discoverable branches. */
final class PublicBrandProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->offsetGet('slug'),
            'name' => $this->getTranslations('name'),
            'description' => $this->getTranslations('description'),
            'universe' => $this->offsetGet('universe'),
            'logo_url' => $this->logo_url,
            'branches' => PublicBranchSummaryResource::collection($this->branches),
        ];
    }
}
