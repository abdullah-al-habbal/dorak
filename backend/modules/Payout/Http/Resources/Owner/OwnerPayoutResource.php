<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Resources\Owner;

use Illuminate\Http\Resources\Json\JsonResource;

/** A payout as its brand owner sees it: no internal admin notes or approver (Gap G4). */
final class OwnerPayoutResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'direction_type' => $this->direction_type->value,
            'total_amount_minor' => $this->total_amount_minor,
            'currency_code' => $this->currency_code,
            'brand' => $this->whenLoaded('brand', fn () => [
                'id' => $this->brand->id,
                'name' => $this->brand->getTranslations('name'),
            ]),
            'period_started_at' => $this->period_started_at?->toIso8601String(),
            'period_ended_at' => $this->period_ended_at?->toIso8601String(),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'external_reference' => $this->external_reference,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
