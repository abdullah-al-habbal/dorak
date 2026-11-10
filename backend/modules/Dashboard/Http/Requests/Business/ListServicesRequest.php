<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListServicesRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string', 'max:100'],
            'brand_id' => ['nullable', 'uuid'],
        ];
    }
}
