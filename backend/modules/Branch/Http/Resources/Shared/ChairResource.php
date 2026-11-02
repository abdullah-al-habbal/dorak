<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Resources\Shared;

use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Chair\Models\ChairModel;

final class ChairResource extends JsonResource
{
    public function toArray($request): array
    {
        $chair = $this->resource instanceof ChairModel ? $this->resource : null;

        return [
            'id' => $this->id,
            'label' => $this->label,
            'status' => $chair?->currentAvailability()->value,
            'availability' => $chair?->currentAvailability()->value,
            'floor_zone' => $chair?->getAttribute('floor_zone')?->value,
            'layout_settings' => $this->layout_settings,
            'barber' => BarberResource::make($this->whenLoaded('barber')),
        ];
    }
}
