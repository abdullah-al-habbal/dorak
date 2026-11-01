<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Illuminate\Validation\Rule;
use Modules\Chair\Enums\ChairStatus;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ToggleChairStatusRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(ChairStatus::class)],
            'force' => ['sometimes', 'boolean'],
        ];
    }
}
