<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Http\Resources\Barber\ApplicationResource;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

final class UpdateApplicationStatusAction extends BaseApiAction
{
    public function __invoke(Request $request, string $jobPosting, string $application): JsonResponse
    {
        $posting = JobPostingModel::findOrFail($jobPosting);

        $branch = $request->user('branch_api');

        abort_unless($branch instanceof BranchModel, 403);

        abort_unless(
            JobPostingModel::whereKey($posting->getKey())
                ->where('branch_id', $branch->getKey())
                ->exists(),
            403,
        );

        $request->validate([
            'status' => ['required', Rule::enum(ApplicationStatus::class)],
        ]);

        $applicationModel = DB::transaction(function () use ($posting, $application, $request): ApplicationModel {
            $model = ApplicationModel::where('job_posting_id', $posting->id)
                ->lockForUpdate()
                ->findOrFail($application);
            $nextStatus = ApplicationStatus::from($request->string('status')->toString());
            $currentStatusValue = $model->getRawOriginal('status');

            if (! is_string($currentStatusValue)) {
                throw ValidationException::withMessages([
                    'status' => [__('jobposting::messages.invalid_status_transition')],
                ]);
            }

            $currentStatus = ApplicationStatus::from($currentStatusValue);
            $allowedTransitions = match ($currentStatus) {
                ApplicationStatus::Submitted => [ApplicationStatus::Reviewed, ApplicationStatus::Accepted, ApplicationStatus::Rejected],
                ApplicationStatus::Reviewed => [ApplicationStatus::Accepted, ApplicationStatus::Rejected],
                ApplicationStatus::Accepted, ApplicationStatus::Rejected => [],
            };

            if (! in_array($nextStatus, $allowedTransitions, true)) {
                throw ValidationException::withMessages([
                    'status' => [__('jobposting::messages.invalid_status_transition')],
                ]);
            }

            $model->update(['status' => $nextStatus]);

            $model->refresh();

            return $model;
        });

        return $this->updated(
            data: new ApplicationResource($applicationModel),
            message: __('jobposting::messages.status_updated'),
        );
    }
}
