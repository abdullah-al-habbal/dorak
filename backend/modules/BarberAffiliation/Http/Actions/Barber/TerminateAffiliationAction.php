<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\BarberAffiliation\Handlers\Shared\TerminateAffiliationHandler;
use Modules\BarberAffiliation\Http\Requests\Barber\TerminateAffiliationRequest;
use Modules\BarberAffiliation\Http\Resources\Barber\BarberAffiliationResource;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class TerminateAffiliationAction extends BaseApiAction
{
    public function __construct(
        private readonly TerminateAffiliationHandler $handler,
    ) {}

    public function __invoke(TerminateAffiliationRequest $request, string $affiliation): JsonResponse
    {
        $result = $this->handler->handle($request->toCommand($affiliation));

        if (! $result->success) {
            return $this->businessError(ErrorCodeEnum::BAD_REQUEST, message: __('barberaffiliation::messages.not_active'));
        }

        return $this->ok(
            data: new BarberAffiliationResource($result->affiliation),
            message: __('barberaffiliation::messages.terminated'),
        );
    }
}
