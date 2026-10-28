<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

final class SubscriptionPlanResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->getTranslations('name'),
            'description' => $this->getTranslations('description'),
            'price_minor' => $this->price_minor,
            'currency' => $this->whenLoaded('currency', fn () => [
                'id' => $this->currency->id,
                'code' => $this->currency->code,
            ]),
            'interval_unit' => $this->interval_unit,
            'interval_count' => $this->interval_count,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'feature_keys' => $this->whenLoaded('features', fn () => $this->featureKeys()),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
