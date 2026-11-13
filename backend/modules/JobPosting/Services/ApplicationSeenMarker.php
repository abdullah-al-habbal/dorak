<?php

declare(strict_types=1);

namespace Modules\JobPosting\Services;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Models\ApplicationModel;

/**
 * Moves a posting's new applications to `seen`, one status-change row per application. Atomic and
 * idempotent; it never touches a decided application.
 */
final class ApplicationSeenMarker
{
    public function __construct(private readonly StatusChangeLogger $statusChangeLogger) {}

    public function markSeen(string $jobPostingId, StatusChangeActorTypeEnum $actorType, string $actorId): int
    {
        return DB::transaction(function () use ($jobPostingId, $actorType, $actorId): int {
            $ids = ApplicationModel::where('job_posting_id', $jobPostingId)
                ->where('status', ApplicationStatus::Submitted)
                ->lockForUpdate()
                ->pluck('id');

            if ($ids->isEmpty()) {
                return 0;
            }

            ApplicationModel::whereIn('id', $ids)->update(['status' => ApplicationStatus::Seen]);

            foreach ($ids as $id) {
                $this->statusChangeLogger->log(
                    StatusChangeSubjectTypeEnum::JobApplication,
                    (string) $id,
                    ApplicationStatus::Submitted->value,
                    ApplicationStatus::Seen->value,
                    $actorType,
                    $actorId,
                );
            }

            return $ids->count();
        });
    }
}
