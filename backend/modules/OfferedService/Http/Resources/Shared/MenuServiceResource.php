<?php

declare(strict_types=1);

namespace Modules\OfferedService\Http\Resources\Shared;

use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A service on a client-facing menu (branch detail, floor plan, barber detail):
 * the shared service payload plus `owner` (`brand` | `branch` | `barber`), the
 * party that offers it (Task 48).
 */
final class MenuServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $type = $this->resource->getAttribute('serviceable_type');

        return [
            ...ServiceResource::make($this->resource)->resolve($request),
            'owner' => is_string($type) ? Relation::getMorphAlias($type) : null,
        ];
    }
}
