<?php

declare(strict_types=1);

namespace Modules\Activation\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** One activation move with who made it and why. */
final class AdminActivationLogResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'reason' => $this->reason,
            'activated_by' => $this->whenLoaded('admin', fn (): ?string => $this->admin?->getAttribute('name')),
            'activated_at' => $this->activated_at?->toIso8601String(),
        ];
    }
}
