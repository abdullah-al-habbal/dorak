<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Branch\Http\Requests\Branch\UpdateJobPostingRequest;
use Modules\Brand\Services\BrandFeatures;
use Modules\Brand\Services\BrandStaffingGuard;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\JobPosting\Http\Resources\Shared\JobPostingResource;
use Modules\JobPosting\Models\JobPostingModel;

final class UpdateBranchJobPostingAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BrandFeatures $brandFeatures,
        private readonly BrandStaffingGuard $staffingGuard,
    ) {}

    public function __invoke(UpdateJobPostingRequest $request, string $branch, string $jobPosting): JsonResponse
    {
        $model = $this->branches->resolveForStaffingWrite($request, $branch);
        Gate::forUser($request->attributes->get('dashboard_actor'))->authorize('dashboard.staffing.manage', $model);
        $this->staffingGuard->ensureBranchMayPublishJobs($model->getKey());
        $this->brandFeatures->ensureJobBoard($model->getKey());

        $posting = JobPostingModel::where('branch_id', $model->getKey())->findOrFail($jobPosting);
        $posting->update($request->validated());

        return $this->updated(data: new JobPostingResource($posting->fresh()->loadCount('applications')));
    }
}
