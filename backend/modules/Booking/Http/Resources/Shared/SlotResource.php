<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Resources\Shared;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `starts_at` and `ends_at` are UTC; `timezone` and `utc_offset_minutes` say how the branch's clock reads them.
 *
 * @property array{starts_at: Carbon, ends_at: Carbon, time_zone: string} $resource
 */
final class SlotResource extends JsonResource
{
    /**
     * @return array{starts_at: string, ends_at: string, timezone: string, utc_offset_minutes: int}
     */
    public function toArray(Request $request): array
    {
        return [
            'starts_at' => $this->resource['starts_at']->utc()->toIso8601ZuluString(),
            'ends_at' => $this->resource['ends_at']->utc()->toIso8601ZuluString(),
            'timezone' => $this->resource['time_zone'],
            'utc_offset_minutes' => intdiv($this->resource['starts_at']->copy()->setTimezone($this->resource['time_zone'])->getOffset(), 60),
        ];
    }
}
