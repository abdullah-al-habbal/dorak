<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

final class BrandSubscriptionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'brand' => $this->whenLoaded('brand', fn () => [
                'id' => $this->brand->id,
                'name' => $this->brand->getTranslations('name'),
            ]),
            'plan' => $this->whenLoaded('plan', fn () => [
                'id' => $this->plan->id,
                'name' => $this->plan->getTranslations('name'),
            ]),
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'past_due_at' => $this->past_due_at?->toIso8601String(),
            'grace_ends_at' => $this->graceEndsAt()?->toIso8601String(),
            'canceled_at' => $this->canceled_at?->toIso8601String(),
        ];
    }
}
