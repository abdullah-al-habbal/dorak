<?php

declare(strict_types=1);

namespace Modules\Client\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Ban\Http\Resources\Admin\AdminBanResource;

/**
 * D4: the platform team sees the account, bans, bookings and reviews only. Face analysis,
 * preference vectors, interaction logs, favourites and service histories are never part of this payload.
 */
final class AdminClientResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->offsetGet('phone'),
            'email_verified_at' => $this->offsetGet('email_verified_at'),
            'phone_verified_at' => $this->offsetGet('phone_verified_at'),
            'status' => $this->status,
            'is_banned' => $this->offsetExists('is_banned') ? (bool) $this->offsetGet('is_banned') : $this->isBanned(),
            'bookings_count' => $this->whenCounted('bookings'),
            'bans' => $this->whenLoaded('bans', fn () => AdminBanResource::collection($this->bans->sortByDesc('banned_at')->values())),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
