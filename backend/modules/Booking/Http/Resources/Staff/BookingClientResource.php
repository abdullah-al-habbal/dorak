<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Resources\Staff;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Client\Models\ClientModel;

/**
 * The client as staff (branch, barber, dashboard) see them on a booking,
 * including the reputation other shops gave them. Never returned to clients.
 *
 * @mixin ClientModel
 */
final class BookingClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $average = $this->offsetGet('reputation_average');
        $count = $this->offsetGet('reputation_count');

        if ($average === null && $count === null) {
            $average = $this->resource->receivedReviews()->avg('rating');
            $count = $this->resource->receivedReviews()->count();
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->offsetGet('phone'),
            'reputation' => [
                'average' => $average === null ? null : round((float) $average, 2),
                'count' => (int) $count,
            ],
        ];
    }
}
