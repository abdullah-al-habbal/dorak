<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Handlers\Branch\ForgotPasswordHandler;
use Modules\Branch\Http\Requests\Branch\ForgotPasswordRequest;
use Modules\Core\Http\Actions\BaseApiAction;

final class ForgotPasswordAction extends BaseApiAction
{
    public function __construct(
        private readonly ForgotPasswordHandler $handler,
    ) {}

    public function __invoke(ForgotPasswordRequest $request): JsonResponse
    {
        $this->handler->handle($request->toCommand());

        return $this->success(message: $this->trans('core::messages.reset_code_sent'));
    }
}
