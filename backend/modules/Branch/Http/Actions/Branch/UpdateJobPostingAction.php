<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Http\Requests\Branch\UpdateJobPostingRequest;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\JobPosting\Models\JobPostingModel;

final class UpdateJobPostingAction extends BaseApiAction
{
    public function __construct(private readonly BrandFeatures $brandFeatures) {}

    public function __invoke(UpdateJobPostingRequest $request, string $jobPosting): JsonResponse
    {
        $branch = $request->user('branch_api');
        $this->brandFeatures->ensureJobBoard($branch?->getKey());

        $jobPostingModel = JobPostingModel::where('branch_id', $branch->id)->findOrFail($jobPosting);

        $validated = $request->validated();

        $jobPostingModel->update($validated);

        return $this->success(
            data: $jobPostingModel->fresh()->loadCount('applications'),
            code: SuccessCodeEnum::UPDATED,
        );
    }
}
