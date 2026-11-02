<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Resources\Client;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Branch\Http\Resources\Shared\ChairResource;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;

final class BookingResource extends JsonResource
{
    public function toArray($request): array
    {
        $endsAt = $this->offsetGet('ends_at');

        return [
            'id' => $this->id,
            'starts_at' => $this->starts_at->toIso8601String(),
            'ends_at' => $endsAt instanceof Carbon ? $endsAt->toIso8601String() : null,
            'booking_status' => $this->booking_status,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'chair' => ChairResource::make($this->whenLoaded('chair')),
            'barber' => BarberResource::make($this->whenLoaded('barber')),
            'services' => ServiceResource::collection($this->whenLoaded('services')),
            'home_address' => $this->home_address,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
