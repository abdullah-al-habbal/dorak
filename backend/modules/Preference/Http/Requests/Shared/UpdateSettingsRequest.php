<?php

declare(strict_types=1);

namespace Modules\Preference\Http\Requests\Shared;

use Illuminate\Validation\Rule;
use Modules\Core\Enums\Locale;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Preference\Enums\PriceDisplayModeEnum;
use Modules\Preference\Enums\ThemeEnum;

final class UpdateSettingsRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'preferred_language' => ['sometimes', 'nullable', Rule::enum(Locale::class)],
            'allows_notifications' => ['sometimes', 'boolean'],
            'display_currency_code' => ['sometimes', 'nullable', 'exists:currencies,code'],
            'theme_mode' => ['sometimes', 'nullable', Rule::enum(ThemeEnum::class)],
            'price_display_mode' => ['sometimes', 'nullable', Rule::enum(PriceDisplayModeEnum::class)],
        ];
    }

    /** @return array<string, mixed> */
    public function toAttributes(): array
    {
        return $this->validated();
    }
}
