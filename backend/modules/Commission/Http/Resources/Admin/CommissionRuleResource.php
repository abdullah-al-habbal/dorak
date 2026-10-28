<?php

declare(strict_types=1);

namespace Modules\Commission\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

final class CommissionRuleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'scope' => $this->scope->value,
            'scope_id' => $this->scope_id,
            'type' => $this->type->value,
            'value' => $this->value,
            'currency' => $this->whenLoaded('currency', fn () => $this->currency === null ? null : [
                'id' => $this->currency->id,
                'code' => $this->currency->code,
            ]),
            'is_active' => $this->is_active,
            'notes' => $this->notes,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
