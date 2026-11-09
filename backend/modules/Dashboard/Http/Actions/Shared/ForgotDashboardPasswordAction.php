<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Password\ForgotDashboardPasswordHandler;
use Modules\Dashboard\Http\Requests\Shared\ForgotDashboardPasswordRequest;

/** Public. Always the same answer, whether or not the email belongs to an account. */
final class ForgotDashboardPasswordAction extends BaseApiAction
{
    public function __construct(
        private readonly ForgotDashboardPasswordHandler $handler,
    ) {}

    public function __invoke(ForgotDashboardPasswordRequest $request): JsonResponse
    {
        $this->handler->handle($request->toCommand());

        return $this->success(message: $this->trans('dashboard::messages.password_reset_link_sent'));
    }
}
