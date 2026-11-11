<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

final class PayoutResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'direction_type' => $this->direction_type->value,
            'total_amount_minor' => $this->total_amount_minor,
            'currency' => $this->whenLoaded('currency', fn () => [
                'id' => $this->currency->id,
                'code' => $this->currency->code,
            ]),
            'brand' => $this->whenLoaded('brand', fn () => [
                'id' => $this->brand->id,
                'name' => $this->brand->getTranslations('name'),
            ]),
            'period_started_at' => $this->period_started_at?->toIso8601String(),
            'period_ended_at' => $this->period_ended_at?->toIso8601String(),
            'approved_by' => $this->whenLoaded('approver', fn () => $this->approver === null ? null : [
                'id' => $this->approver->id,
                'name' => $this->approver->getTranslations('name'),
            ]),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'external_reference' => $this->external_reference,
            'notes' => $this->notes,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
