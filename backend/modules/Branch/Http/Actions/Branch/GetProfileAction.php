<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Http\Resources\Branch\BranchProfileResource;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class GetProfileAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        return $this->success(
            data: new BranchProfileResource($request->user('branch_api')),
            code: SuccessCodeEnum::SUCCESS,
        );
    }
}
