<?php

declare(strict_types=1);

namespace Modules\OfferedService\Http\Requests\Barber;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class BarberServiceRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'catalog_item_id' => ['nullable', 'uuid', Rule::exists('service_catalog_items', 'id')->where('is_active', true)],
            'currency_code' => ['required', 'string', Rule::exists('currencies', 'code')],
            'name' => ['required', 'array:en,ar'],
            'name.en' => ['required', 'string', 'max:120'],
            'name.ar' => ['required', 'string', 'max:120'],
            'price_amount_minor' => ['required', 'integer', ValidationLimitConstants::RULE_PRICE_MINOR],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'is_active' => ['sometimes', 'boolean'],
            'is_at_home' => ['sometimes', 'boolean'],
        ];
    }
}
