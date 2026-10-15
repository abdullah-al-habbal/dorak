<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Resources\Shared;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property array{starts_at: Carbon, ends_at: Carbon} $resource
 */
final class SlotResource extends JsonResource
{
    /**
     * @return array{starts_at: string, ends_at: string}
     */
    public function toArray(Request $request): array
    {
        return [
            'starts_at' => $this->resource['starts_at']->utc()->toIso8601ZuluString(),
            'ends_at' => $this->resource['ends_at']->utc()->toIso8601ZuluString(),
        ];
    }
}
