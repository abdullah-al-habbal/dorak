<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\Activation\Exceptions\AccountNotActiveException;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Barber\Handlers\Barber\LoginHandler;
use Modules\Barber\Http\Requests\Barber\LoginRequest;
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
        } catch (AccountBannedException) {
            return $this->forbidden(message: $this->trans('ban::ui.account_banned'), code: 'ACCOUNT_BANNED');
        } catch (AccountNotActiveException) {
            return $this->forbidden(message: $this->trans('activation::messages.account_not_active'), code: 'ACCOUNT_NOT_ACTIVE');
        }

        if ($result->isInvalidCredentials()) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_credentials'));
        }

        return $this->success(data: [
            'token' => $result->token,
            'barber' => $result->barber,
        ]);
    }
}
