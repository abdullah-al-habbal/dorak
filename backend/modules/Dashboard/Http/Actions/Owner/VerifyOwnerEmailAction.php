<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Owner;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Owner\VerifyOwnerEmailHandler;
use Modules\Dashboard\Http\Requests\Owner\VerifyOwnerEmailRequest;
use Modules\Dashboard\Support\DashboardSessionIssuer;

final class VerifyOwnerEmailAction extends BaseApiAction
{
    public function __construct(
        private readonly VerifyOwnerEmailHandler $handler,
        private readonly DashboardSessionIssuer $sessions,
    ) {}

    public function __invoke(VerifyOwnerEmailRequest $request): JsonResponse
    {
        $actor = $this->handler->handle($request->toCommand());

        if ($actor === null) {
            return $this->unprocessable(message: $this->trans('core::messages.invalid_verification_code'));
        }

        return $this->success(data: $this->sessions->issue($actor));
    }
}
