<?php

declare(strict_types=1);

namespace Modules\Currency\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Modules\Currency\Models\CurrencyModel;

/**
 * A currency code must name a currency that exists and is still active. A retired currency is
 * rejected for new input only; rows that already reference it stay readable.
 */
final class ActiveCurrencyRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail(__('currency::messages.currency_not_available'));

            return;
        }

        $isActive = CurrencyModel::query()->where('code', $value)->where('is_active', true)->exists();

        if (! $isActive) {
            $fail(__('currency::messages.currency_not_available'));
        }
    }
}
