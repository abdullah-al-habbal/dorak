<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\DashboardLoginHandler;
use Modules\Dashboard\Http\Requests\RefreshSessionRequest;
use Modules\Dashboard\Repositories\DashboardRefreshTokenResolver;
use Modules\Dashboard\Support\DashboardSessionClaim;

final class RefreshSessionAction extends BaseApiAction
{
    public function __construct(
        private readonly DashboardRefreshTokenResolver $refreshResolver,
        private readonly DashboardLoginHandler $handler,
        private readonly DashboardSessionClaim $claim,
    ) {}

    public function __invoke(RefreshSessionRequest $request): JsonResponse
    {
        $rotated = $this->refreshResolver->rotate((string) $request->validated('refresh_token'));
        if ($rotated === null) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_credentials'));
        }

        $actor = $rotated['actor'];

        return $this->success(data: [
            'claim' => $this->claim->issue($actor),
            'expires_in' => $this->claim->expiresIn(),
            'token' => $this->handler->createToken($actor),
            'refresh_token' => $rotated['token'],
            'refresh_expires_in' => $this->refreshResolver->ttl(),
        ]);
    }
}
