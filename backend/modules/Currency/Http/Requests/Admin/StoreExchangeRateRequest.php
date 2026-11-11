<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Currency\Constants\CurrencyAdminConstants;

/**
 * A new rate for a pair. Rates are a history: the converter uses the newest one that has taken effect,
 * so correcting a rate means adding a newer one. Both currencies must exist, be active and differ.
 */
final class StoreExchangeRateRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $active = Rule::exists('currencies', 'code')->where('is_active', true);

        return [
            'from_currency_code' => ['required', 'string', $active],
            'to_currency_code' => ['required', 'string', 'different:from_currency_code', $active],
            'rate_ratio' => ['required', 'numeric', 'min:'.CurrencyAdminConstants::RATE_MIN, 'max:'.CurrencyAdminConstants::RATE_MAX],
            'effective_at' => ['nullable', 'date'],
        ];
    }
}
