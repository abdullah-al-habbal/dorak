<?php

declare(strict_types=1);

namespace Modules\Client\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Client\Handlers\Client\VerifyResetCodeHandler;
use Modules\Client\Http\Requests\Client\VerifyResetCodeRequest;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class VerifyResetCodeAction extends BaseApiAction
{
    public function __construct(
        private readonly VerifyResetCodeHandler $handler,
    ) {}

    public function __invoke(VerifyResetCodeRequest $request): JsonResponse
    {
        if (! $this->handler->handle($request->toCommand())) {
            $message = $this->trans('core::messages.invalid_reset_code');

            return $this->unprocessable(
                message: $message,
                errors: ['code' => [$message]],
                code: ErrorCodeEnum::VALIDATION_FAILED,
            );
        }

        return $this->success(message: $this->trans('core::messages.reset_code_verified'));
    }
}
