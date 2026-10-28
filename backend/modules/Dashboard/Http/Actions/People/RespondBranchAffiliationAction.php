<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Exceptions\AffiliationResponseException;
use Modules\Branch\Services\BranchAffiliationResponder;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Resources\Shared\DashboardAffiliationResource;
use Modules\Dashboard\Support\ScopedBranchResolver;

/** Accept (`accept` route default true) or reject a pending affiliation of an in-scope branch. */
final class RespondBranchAffiliationAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BranchAffiliationResponder $responder,
    ) {}

    public function __invoke(Request $request, string $branch, string $affiliation): JsonResponse
    {
        $model = $this->branches->resolve($request, $branch);
        $accept = $request->route('accept') === true;

        try {
            $result = $this->responder->respond($model, $affiliation, $accept);
        } catch (AffiliationResponseException $exception) {
            return $this->businessError($exception->errorCode, message: $exception->getMessage());
        }

        return $this->updated(data: new DashboardAffiliationResource($result));
    }
}
