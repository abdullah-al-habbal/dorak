<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Enums\JobPostingTypeEnum;

final class UpdateJobPostingRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'array'],
            'title.en' => ['required_with:title', 'string'],
            'title.ar' => ['required_with:title', 'string'],
            'description' => ['sometimes', 'array'],
            'description.en' => ['required_with:description', 'string'],
            'description.ar' => ['required_with:description', 'string'],
            'requirements' => ['nullable', 'array'],
            'location' => ['nullable', 'string'],
            'employment_type' => ['nullable', Rule::enum(JobPostingTypeEnum::class)],
            'status' => ['nullable', Rule::enum(JobPostingStatusEnum::class)],
        ];
    }
}
