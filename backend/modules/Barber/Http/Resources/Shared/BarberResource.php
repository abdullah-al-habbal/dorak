<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BarberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'bio' => $this->bio,
            'email' => $this->email,
            'phone' => $this->offsetGet('phone'),
            'has_login' => $this->offsetGet('has_login'),
            'is_freelancer' => $this->is_freelancer,
            'universe' => $this->offsetGet('universe'),
            'status' => $this->status,
            'rejection_reason' => $this->offsetGet('rejection_reason'),
            'submission_count' => (int) ($this->offsetGet('submission_count') ?? 1),
            'rating_average' => $this->offsetGet('rating_average') === null ? null : (float) $this->offsetGet('rating_average'),
            'rating_count' => (int) ($this->offsetGet('rating_count') ?? 0),
            'email_verified_at' => $this->offsetGet('email_verified_at'),
            'is_workstation_online' => (bool) $this->offsetGet('is_workstation_online'),
            'travel_radius_km' => $this->travel_radius_km,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'distance' => $this->distance ?? null,
            'compatibility_score' => $this->compatibility_score ?? null,
            'rank' => $this->rank ?? null,
            'created_at' => $this->created_at,
        ];
    }
}
