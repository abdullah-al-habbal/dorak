<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

/** @mixin ServiceCatalogItemTagModel */
final class AdminCatalogTagResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->getTranslations('name'),
            'slug' => $this->slug,
            'group_name' => $this->group_name,
            'is_active' => $this->is_active,
            'items_count' => $this->whenCounted('items'),
        ];
    }
}
