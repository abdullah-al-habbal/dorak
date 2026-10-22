<?php

declare(strict_types=1);

namespace Modules\Client\Http\Resources\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Modules\Client\Models\ClientModel;

/** @mixin ClientModel */
final class ClientProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $avatar = $this->getAttribute('avatar');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $avatar === null ? null : Storage::disk('public')->url($avatar),
            'preferred_universe' => $this->preferred_universe?->value,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
