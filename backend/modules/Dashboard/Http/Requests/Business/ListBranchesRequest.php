<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListBranchesRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(BranchStatusEnum::class)],
            'brand_id' => ['nullable', 'uuid'],
        ];
    }
}
