<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Handlers\Barber\ForgotPasswordHandler;
use Modules\Barber\Http\Requests\Barber\ForgotPasswordRequest;
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
