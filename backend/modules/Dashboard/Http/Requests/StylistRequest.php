<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests;

use Illuminate\Validation\Rule;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Core\Http\Requests\BaseApiFormRequest;

class StylistRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['name' => ['required', 'array:en,ar'], 'name.en' => ['required', 'string', 'max:120'], 'name.ar' => ['required', 'string', 'max:120'], 'email' => ['required', 'email', 'max:255', Rule::unique('barbers', 'email')->ignore($this->route('stylist'))], 'phone' => ['nullable', 'string', 'max:30'], 'password' => ['sometimes', 'string', 'min:12', 'max:255'], 'status' => ['sometimes', Rule::enum(BarberStatusEnum::class)], 'chair_id' => ['nullable', 'uuid', Rule::exists('chairs', 'id')]];
    }
}
