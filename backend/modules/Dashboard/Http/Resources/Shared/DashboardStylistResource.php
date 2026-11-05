<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Barber\Http\Resources\Shared\BarberResource;

/** The shared barber payload plus the chair (and therefore branch) the dashboard needs. */
final class DashboardStylistResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $chair = $this->resource->relationLoaded('chairs') ? $this->resource->chairs->first() : null;

        return [
            ...(new BarberResource($this->resource))->toArray($request),
            'chair' => $chair === null ? null : [
                'id' => $chair->id,
                'label' => $chair->label,
                'branch_id' => $chair->branch_id,
            ],
        ];
    }
}
