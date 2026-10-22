<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Resources\Staff;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\Booking\Models\BookingModel;

/**
 * The booking payload for staff views: the client booking payload plus the
 * client with their reputation (Task 40).
 *
 * @mixin BookingModel
 */
final class StaffBookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing(['client' => fn ($query) => $query->withReputation()]);

        return [
            ...BookingResource::make($this->resource)->resolve($request),
            'client' => BookingClientResource::make($this->resource->getRelation('client')),
        ];
    }
}
