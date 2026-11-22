<?php

declare(strict_types=1);

namespace Modules\JobPosting\Enums;

enum JobPostingStatusEnum: string
{
    case Open = 'open';
    case Closed = 'closed';
    case Archived = 'archived';

    public function label(): string
    {
        return __('jobposting::enums.job_posting_status.'.$this->value);
    }

    public function isOpen(): bool
    {
        return $this === self::Open;
    }
}
