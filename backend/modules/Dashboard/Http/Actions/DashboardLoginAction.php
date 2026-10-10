<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\DashboardLoginHandler;
use Modules\Dashboard\Http\Requests\DashboardLoginRequest;
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
        $actor = $this->handler->authenticate(
            (string) $request->validated('actor_type'),
            (string) $request->validated('email'),
            (string) $request->validated('password'),
        );
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
