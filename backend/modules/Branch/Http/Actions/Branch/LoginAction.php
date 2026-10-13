<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\Activation\Exceptions\AccountNotActiveException;
use Modules\Branch\Handlers\Branch\LoginHandler;
use Modules\Branch\Http\Requests\Branch\LoginRequest;
use Modules\Core\Http\Actions\BaseApiAction;

final class LoginAction extends BaseApiAction
{
    public function __construct(
        private readonly LoginHandler $handler,
    ) {}

    public function __invoke(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->handler->handle($request->toCommand());
        } catch (AccountNotActiveException) {
            return $this->forbidden(message: $this->trans('activation::messages.account_not_active'), code: 'ACCOUNT_NOT_ACTIVE');
        }

        if ($result->isInvalidCredentials()) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_credentials'));
        }

        return $this->success(data: [
            'token' => $result->token,
            'branch' => $result->branch,
        ]);
    }
}
