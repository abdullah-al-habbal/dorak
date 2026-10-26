<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ServiceRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['serviceable_id' => ['required', 'uuid'], 'serviceable_type' => ['required', Rule::in(['brand', 'barber'])], 'catalog_item_id' => ['nullable', 'uuid', Rule::exists('service_catalog_items', 'id')->where('is_active', true)], 'currency_id' => ['required', 'uuid', Rule::exists('currencies', 'id')], 'name' => ['required', 'array:en,ar'], 'name.en' => ['required', 'string', 'max:120'], 'name.ar' => ['required', 'string', 'max:120'], 'price' => ['required', 'numeric', 'min:0'], 'duration' => ['nullable', 'integer', 'min:1', 'max:1440'], 'active' => ['sometimes', 'boolean'], 'at_home' => ['sometimes', 'boolean']];
    }
}
