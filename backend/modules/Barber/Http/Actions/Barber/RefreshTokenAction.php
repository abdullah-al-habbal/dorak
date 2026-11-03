<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Activation\Exceptions\AccountNotActiveException;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Barber\Handlers\Barber\RefreshTokenHandler;
use Modules\Core\Http\Actions\BaseApiAction;

final class RefreshTokenAction extends BaseApiAction
{
    public function __construct(
        private readonly RefreshTokenHandler $handler,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $token = $this->handler->handle($request->user());
        } catch (AccountBannedException) {
            return $this->forbidden(message: $this->trans('ban::ui.account_banned'), code: 'ACCOUNT_BANNED');
        } catch (AccountNotActiveException) {
            return $this->forbidden(message: $this->trans('activation::messages.account_not_active'), code: 'ACCOUNT_NOT_ACTIVE');
        }

        return $this->success(data: ['token' => $token]);
    }
}
