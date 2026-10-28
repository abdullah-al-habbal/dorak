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
            'from_currency_id' => $this->from_currency_id,
            'to_currency_id' => $this->to_currency_id,
            'from_currency_code' => $this->whenLoaded('fromCurrency', fn () => $this->fromCurrency->code),
            'to_currency_code' => $this->whenLoaded('toCurrency', fn () => $this->toCurrency->code),
            'rate' => $this->rate,
            'effective_at' => $this->effective_at?->toIso8601String(),
        ];
    }
}
