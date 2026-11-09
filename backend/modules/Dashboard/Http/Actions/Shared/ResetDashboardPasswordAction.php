<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Password\ResetDashboardPasswordHandler;
use Modules\Dashboard\Http\Requests\Shared\ResetDashboardPasswordRequest;

/** Public. One generic failure for every invalid link, so it reveals nothing about the account. */
final class ResetDashboardPasswordAction extends BaseApiAction
{
    public function __construct(
        private readonly ResetDashboardPasswordHandler $handler,
    ) {}

    public function __invoke(ResetDashboardPasswordRequest $request): JsonResponse
    {
        if (! $this->handler->handle($request->toCommand())) {
            $message = $this->trans('dashboard::messages.password_reset_link_invalid');

            return $this->unprocessable(
                message: $message,
                errors: ['token' => [$message]],
                code: ErrorCodeEnum::VALIDATION_FAILED,
            );
        }

        return $this->success(message: $this->trans('dashboard::messages.password_reset_done'));
    }
}
