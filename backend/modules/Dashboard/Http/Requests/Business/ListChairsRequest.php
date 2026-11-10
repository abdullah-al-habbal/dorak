<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Enums\FloorZone;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListChairsRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string', 'max:100'],
            'branch_id' => ['nullable', 'uuid'],
            'brand_id' => ['nullable', 'uuid'],
            'status' => ['nullable', Rule::enum(ChairStatus::class)],
            'floor_zone' => ['nullable', Rule::enum(FloorZone::class)],
        ];
    }
}
