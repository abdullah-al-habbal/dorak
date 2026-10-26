<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\DashboardLoginHandler;
use Modules\Dashboard\Http\Requests\Shared\DashboardLoginRequest;
use Modules\Dashboard\Repositories\DashboardRefreshTokenResolver;
use Modules\Dashboard\Support\DashboardSessionClaim;

final class DashboardLoginAction extends BaseApiAction
{
    public function __construct(
        private readonly DashboardLoginHandler $handler,
        private readonly DashboardSessionClaim $claim,
        private readonly DashboardRefreshTokenResolver $refreshResolver,
    ) {}

    public function __invoke(DashboardLoginRequest $request): JsonResponse
    {
        $actorType = $request->validated('actor_type');
        $email = $request->validated('email');
        $password = $request->validated('password');

        if (! is_string($actorType) || ! is_string($email) || ! is_string($password)) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_credentials'));
        }

        try {
            $actor = $this->handler->authenticate(
                $actorType,
                $email,
                $password,
            );
        } catch (AccountBannedException) {
            return $this->forbidden(message: $this->trans('ban::ui.account_banned'), code: 'ACCOUNT_BANNED');
        }
        if ($actor === null) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_credentials'));
        }

        return $this->success(data: [
            'claim' => $this->claim->issue($actor),
            'expires_in' => $this->claim->expiresIn(),
            'token' => $this->handler->createToken($actor),
            'refresh_token' => $this->refreshResolver->issue($actor),
            'refresh_expires_in' => $this->refreshResolver->ttl(),
        ]);
    }
}
