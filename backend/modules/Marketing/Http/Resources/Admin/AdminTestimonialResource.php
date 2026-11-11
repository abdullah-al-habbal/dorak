<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Marketing\Models\TestimonialModel;

/** @mixin TestimonialModel */
final class AdminTestimonialResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'section_id' => $this->section_id,
            'author_name' => $this->author_name,
            'author_title' => $this->getTranslations('author_title'),
            'body' => $this->getTranslations('body'),
            'avatar_url' => $this->avatar_url,
            'rating' => $this->rating,
            'sort_order' => $this->sort_order,
        ];
    }
}
