<?php

declare(strict_types=1);

namespace Modules\Preference\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class SettingsResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'preferred_language' => $this->preferred_language?->value,
            'is_notification_enabled' => $this->is_notification_enabled,
            'display_currency_code' => $this->display_currency_code,
            'theme' => $this->theme?->value,
            'price_display_mode' => $this->price_display_mode?->value,
        ];
    }
}
