<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\BarberAffiliation\CQRS\Command\Shared\TerminateAffiliationCommand;
use Modules\BarberAffiliation\Handlers\Shared\TerminateAffiliationHandler;
use Modules\Branch\Services\BranchAffiliationResponder;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Resources\Shared\DashboardAffiliationResource;
use Modules\Dashboard\Support\ScopedBranchResolver;

final class TerminateBranchAffiliationAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BranchAffiliationResponder $responder,
        private readonly TerminateAffiliationHandler $handler,
    ) {}

    public function __invoke(Request $request, string $branch, string $affiliation): JsonResponse
    {
        $model = $this->branches->resolve($request, $branch);
        $affiliationModel = $this->responder->findForBranch($model, $affiliation);

        $result = $this->handler->handle(new TerminateAffiliationCommand(
            $affiliationModel->id,
            StatusChangeActorTypeEnum::Branch->value,
            (string) $model->getKey(),
        ));

        if (! $result->success) {
            return $this->businessError(ErrorCodeEnum::BAD_REQUEST, message: __('barberaffiliation::messages.not_active'));
        }

        return $this->updated(data: new DashboardAffiliationResource($result->affiliation->load('barber')));
    }
}
