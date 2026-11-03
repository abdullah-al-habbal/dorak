<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateProfileRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'array:en,ar'],
            'name.en' => ['sometimes', 'string', ValidationLimitConstants::RULE_NAME_MAX],
            'name.ar' => ['sometimes', 'string', ValidationLimitConstants::RULE_NAME_MAX],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'description' => ['sometimes', 'nullable', 'array:en,ar'],
            'description.en' => ['nullable', 'string', 'max:2000'],
            'description.ar' => ['nullable', 'string', 'max:2000'],
            'address' => ['sometimes', 'nullable', 'array:en,ar'],
            'address.en' => ['nullable', 'string', 'max:255'],
            'address.ar' => ['nullable', 'string', 'max:255'],
            'tags' => ['sometimes', 'nullable', 'array', 'max:20'],
            'tags.*' => ['string', 'max:40'],
        ];
    }
}
