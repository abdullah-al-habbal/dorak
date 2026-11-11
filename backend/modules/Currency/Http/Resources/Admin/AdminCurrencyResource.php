<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Currency\Models\CurrencyModel;

/** @mixin CurrencyModel */
final class AdminCurrencyResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'symbol' => $this->symbol,
            'is_default' => $this->is_default,
            'is_active' => $this->is_active,
        ];
    }
}
