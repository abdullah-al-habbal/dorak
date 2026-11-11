<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Currency\Constants\CurrencyAdminConstants;

/** Create (`POST`) and update (`PUT .../{currency}`). The code is chosen once and never edited. */
final class SaveCurrencyRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $creating = $this->route('currency') === null;

        return [
            ...($creating ? ['code' => ['required', 'string', 'size:'.CurrencyAdminConstants::CODE_LENGTH, 'regex:/^[A-Z]+$/', Rule::unique('currencies', 'code')]] : []),
            'name' => ['required', 'array:en,ar'],
            'name.en' => ['required', 'string', 'max:'.CurrencyAdminConstants::NAME_MAX_LENGTH],
            'name.ar' => ['required', 'string', 'max:'.CurrencyAdminConstants::NAME_MAX_LENGTH],
            'symbol' => ['required', 'string', 'max:'.CurrencyAdminConstants::SYMBOL_MAX_LENGTH],
        ];
    }
}
