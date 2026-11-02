<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Http\Resources\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class ClientFavoriteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'favorited_id' => $this->favorited_id,
            'favorited_type' => $this->favorited_type,
            'favorited' => $this->whenLoaded('favorited', fn () => $this->favorited),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
