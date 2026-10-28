<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Exceptions\AffiliationResponseException;
use Modules\Branch\Services\BranchAffiliationResponder;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class AcceptAffiliationAction extends BaseApiAction
{
    public function __construct(private readonly BranchAffiliationResponder $responder) {}

    public function __invoke(Request $request, string $affiliation): JsonResponse
    {
        try {
            $result = $this->responder->respond($request->user('branch_api'), $affiliation, accept: true);
        } catch (AffiliationResponseException $exception) {
            return $this->businessError($exception->errorCode, message: $exception->getMessage());
        }

        return $this->success(data: $result, code: SuccessCodeEnum::UPDATED);
    }
}
