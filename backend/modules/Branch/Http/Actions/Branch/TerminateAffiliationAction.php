<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\BarberAffiliation\CQRS\Command\Shared\TerminateAffiliationCommand;
use Modules\BarberAffiliation\Handlers\Shared\TerminateAffiliationHandler;
use Modules\BarberAffiliation\Http\Resources\Barber\BarberAffiliationResource;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class TerminateAffiliationAction extends BaseApiAction
{
    public function __construct(
        private readonly TerminateAffiliationHandler $handler,
    ) {}

    public function __invoke(Request $request, string $affiliation): JsonResponse
    {
        $branch = $request->user('branch_api');

        $affiliationModel = BarberAffiliationModel::where('affiliable_id', $branch->id)
            ->where('affiliable_type', 'branch')
            ->findOrFail($affiliation);

        $result = $this->handler->handle(new TerminateAffiliationCommand($affiliationModel->id));

        if (! $result->success) {
            return $this->businessError(ErrorCodeEnum::BAD_REQUEST, message: __('barberaffiliation::messages.not_active'));
        }

        return $this->ok(
            data: new BarberAffiliationResource($result->affiliation),
            message: __('barberaffiliation::messages.terminated'),
        );
    }
}
