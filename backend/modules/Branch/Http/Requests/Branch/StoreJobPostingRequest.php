<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class StoreJobPostingRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'array'],
            'title.en' => ['required', 'string'],
            'title.ar' => ['required', 'string'],
            'description' => ['required', 'array'],
            'description.en' => ['required', 'string'],
            'description.ar' => ['required', 'string'],
            'requirements' => ['nullable', 'array'],
            'location' => ['nullable', 'string'],
            'type' => ['nullable', 'string'],
        ];
    }
}
