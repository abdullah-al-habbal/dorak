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
        $service = $this->resource;
        $effectivePrice = $service->effectivePriceAmountMinor();
        $displayPrice = app(PriceConverter::class)->displayPriceFor(
            request: $request,
            basePriceAmountMinor: $effectivePrice,
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
            'price_amount_minor' => $effectivePrice,
            'currency_code' => $this->currency_code,
            'duration_minutes' => $service->effectiveDurationMinutes(),
            'is_at_home' => (bool) $this->is_at_home,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            ...($service->hasBrandContext() ? [
                'is_overridden' => $service->hasBrandOverride(),
                'default_price_amount_minor' => (int) $this->price_amount_minor,
                'default_duration_minutes' => $this->duration_minutes,
            ] : []),
            ...($displayPrice === null ? [] : [
                'display_price' => $displayPrice->conversionUnavailable ? null : $displayPrice->toArray(),
                'conversion_unavailable' => $displayPrice->conversionUnavailable,
                'allows_dual_price_display' => $displayPrice->allowsDualPriceDisplay,
            ]),
        ];
    }
}
