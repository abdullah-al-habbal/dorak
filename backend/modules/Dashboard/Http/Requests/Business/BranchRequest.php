<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Branch\Support\OpeningHoursRules;
use Modules\Core\Enums\VenueUniverse;
use Modules\Core\Http\Requests\BaseApiFormRequest;

class BranchRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['brand_id' => ['required', 'uuid', Rule::exists('brands', 'id')], 'name' => ['required', 'array:en,ar'], 'name.en' => ['required', 'string', 'max:120'], 'name.ar' => ['required', 'string', 'max:120'], 'email' => ['required', 'email', 'max:255', Rule::unique('branches', 'email')->ignore($this->route('branch'))], 'password' => ['sometimes', 'string', 'min:12', 'max:255'], 'universe' => ['sometimes', Rule::enum(VenueUniverse::class)], 'latitude' => ['nullable', 'numeric', 'between:-90,90'], 'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'description' => ['sometimes', 'nullable', 'array:en,ar'], 'description.en' => ['nullable', 'string', 'max:2000'], 'description.ar' => ['nullable', 'string', 'max:2000'],
            'address' => ['sometimes', 'nullable', 'array:en,ar'], 'address.en' => ['nullable', 'string', 'max:255'], 'address.ar' => ['nullable', 'string', 'max:255'],
            'tags' => ['sometimes', 'nullable', 'array', 'max:20'], 'tags.*' => ['string', 'max:40'],
            ...OpeningHoursRules::week('opening_hours', required: false)];
    }
}
