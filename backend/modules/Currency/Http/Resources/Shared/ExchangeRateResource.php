<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Resources\Shared;

use Illuminate\Http\Resources\Json\JsonResource;

final class ExchangeRateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'from_currency_code' => $this->from_currency_code,
            'to_currency_code' => $this->to_currency_code,
            'rate_ratio' => $this->rate_ratio,
            'effective_at' => $this->effective_at?->toIso8601String(),
        ];
    }
}
