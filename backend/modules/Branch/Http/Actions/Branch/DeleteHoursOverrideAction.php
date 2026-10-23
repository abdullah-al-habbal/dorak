<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Http\Resources\Branch\BranchProfileResource;
use Modules\Branch\Services\BranchHours;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class DeleteHoursOverrideAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures,
        private readonly BranchHours $hours,
    ) {}

    public function __invoke(Request $request, string $date): JsonResponse
    {
        $branch = $request->user('branch_api');
        $this->brandFeatures->ensureBranchManageable($branch->getKey());

        $this->hours->clearOverride($branch, $date);

        return $this->success(data: new BranchProfileResource($branch), code: SuccessCodeEnum::UPDATED);
    }
}
