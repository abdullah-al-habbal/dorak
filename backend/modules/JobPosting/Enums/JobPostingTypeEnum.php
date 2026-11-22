<?php

declare(strict_types=1);

namespace Modules\JobPosting\Enums;

enum JobPostingTypeEnum: string
{
    case FullTime = 'full-time';
    case PartTime = 'part-time';
    case Contract = 'contract';

    public function label(): string
    {
        return __('jobposting::enums.job_posting_type.'.$this->value);
    }
}
