<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Resources\Shared;

use Illuminate\Http\Resources\Json\JsonResource;
use Modules\BarberAffiliation\Enums\AffiliationStatus;

final class DashboardAffiliationResource extends JsonResource
{
    public function toArray($request): array
    {
        $status = $this->status;

        return [
            'id' => $this->id,
            'barber_id' => $this->barber_id,
            'barber_name' => $this->whenLoaded('barber', fn () => $this->barber->name),
            'status' => $status instanceof AffiliationStatus ? $status->value : $status,
            'initiated_by_type' => $this->initiated_by_type?->value,
            'commission_rate' => $this->commission_rate,
            'invited_at' => $this->invited_at?->toIso8601String(),
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            'terminated_at' => $this->terminated_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
