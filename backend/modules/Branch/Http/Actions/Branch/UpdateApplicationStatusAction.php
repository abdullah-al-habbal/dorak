<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Branch\Http\Requests\Branch\UpdateApplicationStatusRequest;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\JobPosting\Http\Resources\Barber\ApplicationResource;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\JobPosting\Services\ApplicationStatusUpdater;

final class UpdateApplicationStatusAction extends BaseApiAction
{
    public function __construct(private readonly ApplicationStatusUpdater $updater) {}

    public function __invoke(UpdateApplicationStatusRequest $request, string $jobPosting, string $application): JsonResponse
    {
        $posting = JobPostingModel::findOrFail($jobPosting);
        $branch = $request->user('branch_api');

        abort_unless($branch instanceof BranchModel, 403);
        abort_unless($posting->branch_id === $branch->getKey(), 403);

        return $this->updated(
            data: new ApplicationResource($this->updater->update($posting, $application, $request->nextStatus(), StatusChangeActorTypeEnum::Branch, (string) $branch->getKey())),
            message: __('jobposting::messages.status_updated'),
        );
    }
}
