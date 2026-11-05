<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\UpdateBranchOpeningHoursRequest;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateBranchOpeningHoursAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures,
        private readonly BranchHours $hours,
    ) {}

    public function __invoke(UpdateBranchOpeningHoursRequest $request, BranchModel $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $branchId = (string) $branch->getKey();
        $this->brandFeatures->ensureBranchManageable($branchId);
        if (! $actor->isPlatformAdmin() && ! $actor->canAccessBranch($branchId)) {
            return $this->forbidden();
        }

        $this->hours->replaceWeek($branch, $request->validated('hours'));

        return $this->updated(['opening_hours' => $this->hours->week($branch)]);
    }
}
