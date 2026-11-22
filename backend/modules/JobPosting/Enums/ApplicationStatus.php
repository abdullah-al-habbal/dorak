<?php

declare(strict_types=1);

namespace Modules\JobPosting\Enums;

enum ApplicationStatus: string
{
    case Submitted = 'submitted';
    case Seen = 'seen';
    case Accepted = 'accepted';
    case Rejected = 'rejected';

    /**
     * Which of several duplicate applications to keep (approved rule): Accepted > Seen > Submitted > Rejected.
     * Equal priority keeps the oldest row.
     */
    public function retentionPriority(): int
    {
        return match ($this) {
            self::Accepted => 3,
            self::Seen => 2,
            self::Submitted => 1,
            self::Rejected => 0,
        };
    }

    public function label(): string
    {
        return __('jobposting::enums.application_status.'.$this->value);
    }
}
