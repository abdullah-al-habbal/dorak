<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Marketing\Models\SectionModel;

/** @mixin SectionModel */
final class AdminSectionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'page_id' => $this->page_id,
            'section_type' => $this->section_type->value,
            'title' => $this->getTranslations('title'),
            'subtitle' => $this->getTranslations('subtitle'),
            'body' => $this->getTranslations('body'),
            'media_url' => $this->media_url,
            'sort_order' => $this->sort_order,
            'universe_visibility' => $this->universe_visibility->value,
        ];
    }
}
