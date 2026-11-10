<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Branch\Models\BranchHoursOverrideModel;

/** @mixin BranchHoursOverrideModel */
final class BranchHoursOverrideResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'date' => $this->override_date->toDateString(),
            'is_closed' => (bool) $this->is_closed,
            'opens_time' => $this->is_closed ? null : substr((string) $this->opens_time, 0, 5),
            'closes_time' => $this->is_closed ? null : substr((string) $this->closes_time, 0, 5),
        ];
    }
}
