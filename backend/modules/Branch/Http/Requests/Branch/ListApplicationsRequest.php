<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\JobPosting\Constants\JobPostingConstants;

final class ListApplicationsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.JobPostingConstants::JOB_POSTING_APPLICATIONS_MAX_PER_PAGE],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', JobPostingConstants::JOB_POSTING_APPLICATIONS_DEFAULT_PER_PAGE);
    }
}
