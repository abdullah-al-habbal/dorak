<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** The brand a branch belongs to, as a link target on a public page: no owner, status or feature data. */
final class PublicBrandSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->offsetGet('slug'),
            'name' => $this->getTranslations('name'),
            'logo_url' => $this->logo_url,
        ];
    }
}
