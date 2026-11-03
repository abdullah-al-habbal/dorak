<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Handlers\Branch\ResetPasswordHandler;
use Modules\Branch\Http\Requests\Branch\ResetPasswordRequest;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class ResetPasswordAction extends BaseApiAction
{
    public function __construct(
        private readonly ResetPasswordHandler $handler,
    ) {}

    public function __invoke(ResetPasswordRequest $request): JsonResponse
    {
        if (! $this->handler->handle($request->toCommand())) {
            $message = $this->trans('core::messages.invalid_reset_code');

            return $this->unprocessable(
                message: $message,
                errors: ['code' => [$message]],
                code: ErrorCodeEnum::VALIDATION_FAILED,
            );
        }

        return $this->success(message: $this->trans('core::messages.password_reset'));
    }
}
