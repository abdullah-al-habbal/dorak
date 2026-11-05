<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class StoreServiceCategoryRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'array:en,ar'],
            'name.en' => ['required', 'string', 'max:120', Rule::unique('service_catalog_categories', 'name->en')->whereNull('deleted_at')],
            'name.ar' => ['required', 'string', 'max:120', Rule::unique('service_catalog_categories', 'name->ar')->whereNull('deleted_at')],
        ];
    }
}
