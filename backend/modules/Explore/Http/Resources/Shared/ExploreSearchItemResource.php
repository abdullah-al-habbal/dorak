<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Branch\Http\Resources\Shared\BranchResource;

/**
 * One `explore/search` result: `type` (`branch` | `barber`), `distance` in km
 * (null for freelancers without a base location) and the `entity` in the same
 * shape as `explore/branches` / `explore/barbers` items.
 */
final class ExploreSearchItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var array{type: string, distance: float|null, entity: mixed} $item */
        $item = $this->resource;

        return [
            'type' => $item['type'],
            'distance' => $item['distance'],
            'entity' => $item['type'] === 'branch'
                ? BranchResource::make($item['entity'])->resolve($request)
                : BarberResource::make($item['entity'])->resolve($request),
        ];
    }
}
