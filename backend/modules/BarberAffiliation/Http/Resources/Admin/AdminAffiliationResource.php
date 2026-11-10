<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** A barber's affiliation as the platform team reads it: where, since when, and its state. */
final class AdminAffiliationResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'affiliable_type' => $this->affiliable_type,
            'affiliable_name' => $this->whenLoaded('affiliable', fn () => $this->affiliable?->getAttribute('name')),
            'status' => $this->status,
            'commission_percent' => $this->commission_percent,
            'invited_at' => $this->invited_at?->toIso8601String(),
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            'terminated_at' => $this->terminated_at?->toIso8601String(),
        ];
    }
}
