<?php

declare(strict_types=1);

namespace Modules\JobPosting\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Jobs\JobApplicationStatusChangedNotification;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

/** Branch-side decision on an applicant; shared by the branch-account and dashboard routes. */
final class ApplicationStatusUpdater
{
    public function __construct(private readonly StatusChangeLogger $statusChangeLogger) {}

    /**
     * The decision is written to the status-change log with who made it (the branch, or the platform admin acting for it).
     *
     * @throws ValidationException when the transition is not allowed
     */
    public function update(JobPostingModel $posting, string $applicationId, ApplicationStatus $next, StatusChangeActorTypeEnum $actorType, string $actorId): ApplicationModel
    {
        return DB::transaction(function () use ($posting, $applicationId, $next, $actorType, $actorId): ApplicationModel {
            $model = ApplicationModel::where('job_posting_id', $posting->id)
                ->lockForUpdate()
                ->findOrFail($applicationId);
            $currentStatusValue = $model->getRawOriginal('status');

            if (! is_string($currentStatusValue)) {
                throw $this->invalidTransition();
            }

            $allowed = match (ApplicationStatus::from($currentStatusValue)) {
                ApplicationStatus::Submitted => [ApplicationStatus::Seen, ApplicationStatus::Accepted, ApplicationStatus::Rejected],
                ApplicationStatus::Seen => [ApplicationStatus::Accepted, ApplicationStatus::Rejected],
                ApplicationStatus::Accepted, ApplicationStatus::Rejected => [],
            };

            if (! in_array($next, $allowed, true)) {
                throw $this->invalidTransition();
            }

            $model->update(['status' => $next]);
            $model->refresh();

            $this->statusChangeLogger->log(
                StatusChangeSubjectTypeEnum::JobApplication,
                (string) $model->id,
                $currentStatusValue,
                $next->value,
                $actorType,
                $actorId,
            );

            JobApplicationStatusChangedNotification::dispatch((string) $model->id, app()->getLocale())->afterCommit();

            return $model;
        });
    }

    private function invalidTransition(): ValidationException
    {
        return ValidationException::withMessages([
            'status' => [__('jobposting::messages.invalid_status_transition')],
        ]);
    }
}
