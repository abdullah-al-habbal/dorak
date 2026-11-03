<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\OfferedService\Constants\ServiceOverrideConstants;

/** A brand's own price and/or duration for one barber service; an omitted field keeps the barber's default. */
final class UpsertBarberServiceOverrideRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'brand_id' => ['required', 'uuid', Rule::exists('brands', 'id')],
            'price_amount_minor' => ['nullable', 'integer', 'min:0', 'required_without:duration_minutes'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:'.ServiceOverrideConstants::SERVICE_OVERRIDE_MAX_DURATION_MINUTES, 'required_without:price_amount_minor'],
        ];
    }
}
