<?php

declare(strict_types=1);

namespace Modules\Payment\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

/** Never exposes config values — only which keys are set. */
final class PaymentGatewayResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->getTranslations('name'),
            'driver' => $this->driver,
            'is_active' => $this->is_active,
            'is_default' => $this->is_default,
            'config_keys' => array_keys($this->config ?? []),
            'sort_order' => $this->sort_order,
        ];
    }
}
