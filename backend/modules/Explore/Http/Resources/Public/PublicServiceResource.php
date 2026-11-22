<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\OfferedService\Enums\ServiceableTypeEnum;

/** A service on a public page: what a visitor needs to read a menu, with no id, owner id or brand override data. */
final class PublicServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $type = $this->resource->getAttribute('serviceable_type');

        return [
            'name' => $this->name,
            'description' => $this->description,
            'price_amount_minor' => $this->resource->effectivePriceAmountMinor(),
            'currency_code' => $this->currency_code,
            'duration_minutes' => $this->resource->effectiveDurationMinutes(),
            'is_at_home' => (bool) $this->is_at_home,
            'owner' => $type instanceof ServiceableTypeEnum ? $type->value : null,
        ];
    }
}
