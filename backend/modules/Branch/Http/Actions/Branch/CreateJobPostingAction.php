<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Http\Requests\Branch\StoreJobPostingRequest;
use Modules\Brand\Services\BrandFeatures;
use Modules\Brand\Services\BrandStaffingGuard;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Models\JobPostingModel;

final class CreateJobPostingAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures,
        private readonly BrandStaffingGuard $staffingGuard,
    ) {}

    public function __invoke(StoreJobPostingRequest $request): JsonResponse
    {
        $branch = $request->user('branch_api');
        $this->staffingGuard->ensureBranchMayPublishJobs($branch?->getKey());
        $this->brandFeatures->ensureJobBoard($branch?->getKey());

        $validated = $request->validated();

        $jobPosting = JobPostingModel::create([
            'branch_id' => $branch->id,
            ...$validated,
            'status' => JobPostingStatusEnum::Open,
        ]);

        return $this->success(
            data: $jobPosting->loadCount('applications'),
            code: SuccessCodeEnum::CREATED,
        );
    }
}
