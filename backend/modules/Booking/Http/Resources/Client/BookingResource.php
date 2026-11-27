<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Resources\Client;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Barber\Http\Resources\Shared\PublicBarberResource;
use Modules\Branch\Http\Resources\Shared\ChairResource;
use Modules\Branch\Services\BranchTimeZones;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;
use Modules\OfferedService\Services\EffectiveServiceTerms;

final class BookingResource extends JsonResource
{
    public function toArray($request): array
    {
        $endsAt = $this->offsetGet('ends_at');
        $this->applyBrandTerms();
        $branchId = $this->branchId();
        $zones = app(BranchTimeZones::class);

        return [
            'id' => $this->id,
            'starts_at' => $this->starts_at->toIso8601String(),
            'ends_at' => $endsAt instanceof Carbon ? $endsAt->toIso8601String() : null,
            'timezone' => $zones->for($branchId),
            'utc_offset_minutes' => $zones->offsetMinutes($branchId, $this->starts_at),
            'booking_status' => $this->booking_status,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'chair' => ChairResource::make($this->whenLoaded('chair')),
            'barber' => PublicBarberResource::make($this->whenLoaded('barber')),
            'services' => ServiceResource::collection($this->whenLoaded('services')),
            'home_address' => $this->home_address,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }

    /** Prices a booking's barber services as its branch's brand charges them (Gap G6). */
    private function applyBrandTerms(): void
    {
        if (! $this->resource->relationLoaded('services')) {
            return;
        }

        $terms = app(EffectiveServiceTerms::class);
        $terms->attach($this->services, $terms->brandIdForBranch($this->branchId()));
    }

    private function branchId(): ?string
    {
        $branchId = $this->branch_id ?? ($this->resource->relationLoaded('chair') ? $this->chair?->branch_id : null);

        return is_string($branchId) ? $branchId : null;
    }
}
