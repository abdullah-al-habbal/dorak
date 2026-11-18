<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * What any client or visitor may see of a barber (BG-4): no phone, no real email, no
 * verification or review-process fields, and a location rounded to about a kilometre.
 *
 * `email` stays in the payload as an empty string only because mobile builds already in the
 * stores read it as a required string; remove it once both apps have shipped (T10.4).
 */
final class PublicBarberResource extends JsonResource
{
    /** Two decimals is roughly 1.1 km, enough to place a freelancer in a district. */
    public const int COORDINATE_PRECISION = 2;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'bio' => $this->bio,
            'email' => '',
            'is_freelancer' => $this->is_freelancer,
            'universe' => $this->offsetGet('universe'),
            'status' => $this->status,
            'rating_average' => $this->offsetGet('rating_average') === null ? null : (float) $this->offsetGet('rating_average'),
            'rating_count' => (int) ($this->offsetGet('rating_count') ?? 0),
            'is_workstation_online' => (bool) $this->offsetGet('is_workstation_online'),
            'travel_radius_km' => $this->travel_radius_km,
            'latitude' => $this->rounded($this->latitude),
            'longitude' => $this->rounded($this->longitude),
            'distance' => $this->distance ?? null,
            'compatibility_score' => $this->compatibility_score ?? null,
            'rank' => $this->rank ?? null,
            'created_at' => $this->created_at,
        ];
    }

    private function rounded(mixed $coordinate): ?float
    {
        return $coordinate === null ? null : round((float) $coordinate, self::COORDINATE_PRECISION);
    }
}
