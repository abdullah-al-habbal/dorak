<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;

/** Names the brand whose terms for a barber's services are being read or cleared (Gap G6). */
final class BarberServiceOverrideScopeRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'brand_id' => ['required', 'uuid', Rule::exists('brands', 'id')],
        ];
    }
}
