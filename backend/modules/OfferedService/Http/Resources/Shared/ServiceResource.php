<?php

declare(strict_types=1);

namespace Modules\OfferedService\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Currency\Services\PriceConverter;
use Modules\Preference\Enums\PreferenceableTypeEnum;

final class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $displayPrice = app(PriceConverter::class)->displayPriceFor(
            request: $request,
            basePrice: (float) $this->price,
            baseCurrencyCode: $this->currency?->code ?? '',
            ownerType: PreferenceableTypeEnum::from($this->serviceable_type->value),
            ownerId: (string) $this->serviceable_id,
        );

        return [
            'id' => $this->id,
            'serviceable_id' => $this->serviceable_id,
            'serviceable_type' => $this->serviceable_type->value,
            'catalog_item_id' => $this->catalog_item_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'currency_id' => $this->currency_id,
            'duration' => $this->duration,
            'is_at_home' => (bool) $this->is_at_home,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            ...($displayPrice === null ? [] : [
                'display_price' => $displayPrice->conversionUnavailable ? null : $displayPrice->toArray(),
                'conversion_unavailable' => $displayPrice->conversionUnavailable,
                'is_dual_price_display_enabled' => $displayPrice->isDualPriceDisplayEnabled,
            ]),
        ];
    }
}
