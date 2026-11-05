<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListStylistsRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string', 'max:100'],
            'chair_id' => ['nullable', 'uuid'],
            'status' => ['nullable', Rule::enum(BarberStatusEnum::class)],
        ];
    }
}
