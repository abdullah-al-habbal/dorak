<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Owner;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Owner\RegisterOwnerHandler;
use Modules\Dashboard\Http\Requests\Owner\RegisterOwnerRequest;

/** Public. Always "check your email", whatever the email already is. */
final class RegisterOwnerAction extends BaseApiAction
{
    public function __construct(private readonly RegisterOwnerHandler $handler) {}

    public function __invoke(RegisterOwnerRequest $request): JsonResponse
    {
        $this->handler->handle($request->toCommand());

        return $this->success(message: $this->trans('dashboard::messages.owner_check_email'));
    }
}
