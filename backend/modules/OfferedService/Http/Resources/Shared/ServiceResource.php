<?php

declare(strict_types=1);

namespace Modules\OfferedService\Http\Resources\Shared;

use Illuminate\Http\Resources\Json\JsonResource;

final class ServiceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'serviceable_id' => $this->serviceable_id,
            'serviceable_type' => $this->serviceable_type,
            'catalog_item_id' => $this->catalog_item_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'currency_id' => $this->currency_id,
            'duration' => $this->duration,
            'at_home' => (bool) $this->at_home,
            'active' => (bool) $this->active,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
