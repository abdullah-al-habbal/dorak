<?php

declare(strict_types=1);

namespace Modules\Commission\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

final class CommissionEntryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'brand_id' => $this->brand_id,
            'branch_id' => $this->branch_id,
            'base_amount_minor' => $this->base_amount_minor,
            'commission_amount_minor' => $this->commission_amount_minor,
            'currency' => $this->whenLoaded('currency', fn () => [
                'id' => $this->currency->id,
                'code' => $this->currency->code,
            ]),
            'rule' => $this->rule_snapshot,
            'payout_id' => $this->payout_id,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
