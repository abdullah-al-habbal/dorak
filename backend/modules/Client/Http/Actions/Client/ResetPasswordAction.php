<?php

declare(strict_types=1);

namespace Modules\Client\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Client\Handlers\Client\ResetPasswordHandler;
use Modules\Client\Http\Requests\Client\ResetPasswordRequest;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class ResetPasswordAction extends BaseApiAction
{
    public function __construct(
        private readonly ResetPasswordHandler $handler,
    ) {}

    public function __invoke(ResetPasswordRequest $request): JsonResponse
    {
        $result = $this->handler->handle($request->toCommand());

        if ($result->isInvalidCode()) {
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
