<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Http\Requests\Branch\UpdateJobPostingRequest;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\JobPosting\Http\Resources\Shared\JobPostingResource;
use Modules\JobPosting\Models\JobPostingModel;

final class UpdateBranchJobPostingAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BrandFeatures $brandFeatures,
    ) {}

    public function __invoke(UpdateJobPostingRequest $request, string $branch, string $jobPosting): JsonResponse
    {
        $model = $this->branches->resolveForTeam($request, $branch);
        $this->brandFeatures->ensureJobBoard($model->getKey());

        $posting = JobPostingModel::where('branch_id', $model->getKey())->findOrFail($jobPosting);
        $posting->update($request->validated());

        return $this->updated(data: new JobPostingResource($posting->fresh()->loadCount('applications')));
    }
}
