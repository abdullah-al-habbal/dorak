<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests;

use Illuminate\Validation\Rule;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Core\Http\Requests\BaseApiFormRequest;

class BranchRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['brand_id' => ['required', 'uuid', Rule::exists('brands', 'id')], 'name' => ['required', 'array:en,ar'], 'name.en' => ['required', 'string', 'max:120'], 'name.ar' => ['required', 'string', 'max:120'], 'email' => ['required', 'email', 'max:255', Rule::unique('branches', 'email')->ignore($this->route('branch'))], 'password' => ['sometimes', 'string', 'min:12', 'max:255'], 'status' => ['sometimes', Rule::enum(BranchStatusEnum::class)], 'latitude' => ['nullable', 'numeric', 'between:-90,90'], 'longitude' => ['nullable', 'numeric', 'between:-180,180']];
    }
}
