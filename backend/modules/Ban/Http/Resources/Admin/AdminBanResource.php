<?php

declare(strict_types=1);

namespace Modules\Ban\Http\Resources\Admin;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** One ban with who set it and who lifted it. */
final class AdminBanResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $expires = $this->offsetGet('expires_at');
        $lifted = $this->offsetGet('lifted_at');

        return [
            'id' => $this->id,
            'reason' => $this->reason,
            'banned_at' => $this->banned_at?->toIso8601String(),
            'expires_at' => $expires instanceof Carbon ? $expires->toIso8601String() : null,
            'lifted_at' => $lifted instanceof Carbon ? $lifted->toIso8601String() : null,
            'banned_by' => $this->whenLoaded('admin', fn (): ?string => $this->admin?->getAttribute('name')),
            'active' => $this->banned_at !== null && $this->banned_at->lte(now()) && ($expires === null || $expires->gt(now())),
        ];
    }
}
