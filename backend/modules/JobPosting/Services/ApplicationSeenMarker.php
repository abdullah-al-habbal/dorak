<?php

declare(strict_types=1);

namespace Modules\JobPosting\Services;

use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Models\ApplicationModel;

/** Moves a posting's new applications to `seen`. One atomic, idempotent update; it never touches a decided application. */
final class ApplicationSeenMarker
{
    public function markSeen(string $jobPostingId): int
    {
        return ApplicationModel::where('job_posting_id', $jobPostingId)
            ->where('status', ApplicationStatus::Submitted)
            ->update(['status' => ApplicationStatus::Seen]);
    }
}
