<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Enums\JobPostingTypeEnum;

final class UpdateJobPostingRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'array:en,ar'],
            'title.en' => ['required_with:title', 'string', ValidationLimitConstants::RULE_TITLE_MAX],
            'title.ar' => ['required_with:title', 'string', ValidationLimitConstants::RULE_TITLE_MAX],
            'description' => ['sometimes', 'array:en,ar'],
            'description.en' => ['required_with:description', 'string', ValidationLimitConstants::RULE_DESCRIPTION_MAX],
            'description.ar' => ['required_with:description', 'string', ValidationLimitConstants::RULE_DESCRIPTION_MAX],
            'requirements' => ['nullable', 'array:en,ar'],
            'requirements.en' => ['nullable', 'string', ValidationLimitConstants::RULE_DESCRIPTION_MAX],
            'requirements.ar' => ['nullable', 'string', ValidationLimitConstants::RULE_DESCRIPTION_MAX],
            'location' => ['nullable', 'string', ValidationLimitConstants::RULE_SHORT_TEXT_MAX],
            'employment_type' => ['nullable', Rule::enum(JobPostingTypeEnum::class)],
            'status' => ['nullable', Rule::enum(JobPostingStatusEnum::class)],
        ];
    }
}
