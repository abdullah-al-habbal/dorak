<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Http\Requests\Branch\UpdateProfileRequest;
use Modules\Branch\Http\Resources\Branch\BranchProfileResource;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class UpdateProfileAction extends BaseApiAction
{
    public function __construct(private readonly BrandFeatures $brandFeatures) {}

    public function __invoke(UpdateProfileRequest $request): JsonResponse
    {
        $branch = $request->user('branch_api');
        $this->brandFeatures->ensureBranchManageable($branch->getKey());

        $branch->update($request->validated());

        return $this->success(
            data: new BranchProfileResource($branch->fresh()),
            code: SuccessCodeEnum::UPDATED,
        );
    }
}
