<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Branch\Http\Requests\Branch\UpdateApplicationStatusRequest;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\AffiliationActorResolver;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\JobPosting\Http\Resources\Barber\ApplicationResource;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\JobPosting\Services\ApplicationStatusUpdater;

final class UpdateBranchApplicationStatusAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly AffiliationActorResolver $actors,
        private readonly ApplicationStatusUpdater $updater,
    ) {}

    public function __invoke(UpdateApplicationStatusRequest $request, string $branch, string $jobPosting, string $application): JsonResponse
    {
        $model = $this->branches->resolveForStaffing($request, $branch);
        $actor = $this->actors->actingAs($request);
        $posting = JobPostingModel::where('branch_id', $model->getKey())->findOrFail($jobPosting);

        return $this->updated(
            data: new ApplicationResource($this->updater->update($posting, $application, $request->nextStatus(), $actor?->type ?? StatusChangeActorTypeEnum::Branch, $actor?->id ?? (string) $model->getKey())),
            message: __('jobposting::messages.status_updated'),
        );
    }
}
