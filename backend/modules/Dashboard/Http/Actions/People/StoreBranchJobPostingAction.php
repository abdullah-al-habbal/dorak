<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Http\Requests\Branch\StoreJobPostingRequest;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Http\Resources\Shared\JobPostingResource;
use Modules\JobPosting\Models\JobPostingModel;

final class StoreBranchJobPostingAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BrandFeatures $brandFeatures,
    ) {}

    public function __invoke(StoreJobPostingRequest $request, string $branch): JsonResponse
    {
        $model = $this->branches->resolveForTeam($request, $branch);
        $this->brandFeatures->ensureJobBoard($model->getKey());

        $posting = JobPostingModel::create([
            'branch_id' => $model->getKey(),
            ...$request->validated(),
            'status' => JobPostingStatusEnum::Open,
        ]);

        return $this->created(data: new JobPostingResource($posting->loadCount('applications')));
    }
}
