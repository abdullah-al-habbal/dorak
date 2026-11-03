<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Resources\Owner;

use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Brand\Services\BrandFeatures;

/** A brand owner's read-only view of their brand's plan, price and effective feature flags (Gap G4). */
final class OwnerBrandSubscriptionResource extends JsonResource
{
    public function toArray($request): array
    {
        $plan = $this->plan;

        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'brand' => [
                'id' => $this->brand->id,
                'name' => $this->brand->getTranslations('name'),
            ],
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->getTranslations('name'),
                'description' => $plan->getTranslations('description'),
                'price_amount_minor' => $plan->price_amount_minor,
                'currency_code' => $plan->currency_code,
                'interval_unit' => $plan->interval_unit->value,
                'interval_count' => $plan->interval_count,
                'feature_keys' => $plan->featureKeys(),
            ],
            'features' => app(BrandFeatures::class)->all($this->brand),
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'past_due_at' => $this->past_due_at?->toIso8601String(),
            'grace_ends_at' => $this->graceEndsAt()?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
        ];
    }
}
