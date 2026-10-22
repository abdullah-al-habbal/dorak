<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BarberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->offsetGet('phone'),
            'has_login' => $this->offsetGet('has_login'),
            'is_freelancer' => $this->is_freelancer,
            'status' => $this->status,
            'email_verified_at' => $this->offsetGet('email_verified_at'),
            'workstation_online' => (bool) $this->offsetGet('workstation_online'),
            'travel_radius' => $this->travel_radius,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'distance' => $this->distance ?? null,
            'compatibility_score' => $this->compatibility_score ?? null,
            'rank' => $this->rank ?? null,
            'created_at' => $this->created_at,
        ];
    }
}
