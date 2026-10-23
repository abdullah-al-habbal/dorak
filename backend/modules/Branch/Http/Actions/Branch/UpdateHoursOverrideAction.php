<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Http\Requests\Branch\UpdateHoursOverrideRequest;
use Modules\Branch\Http\Resources\Branch\BranchProfileResource;
use Modules\Branch\Services\BranchHours;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class UpdateHoursOverrideAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures,
        private readonly BranchHours $hours,
    ) {}

    public function __invoke(UpdateHoursOverrideRequest $request): JsonResponse
    {
        $branch = $request->user('branch_api');
        $this->brandFeatures->ensureBranchManageable($branch->getKey());

        $this->hours->setOverride($branch, $request->validated('date'), $request->safe()->except('date'));

        return $this->success(data: new BranchProfileResource($branch), code: SuccessCodeEnum::UPDATED);
    }
}
