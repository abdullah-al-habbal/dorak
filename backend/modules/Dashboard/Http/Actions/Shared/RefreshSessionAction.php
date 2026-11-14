<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\DashboardRefreshSessionHandler;
use Modules\Dashboard\Http\Requests\Shared\RefreshSessionRequest;

final class RefreshSessionAction extends BaseApiAction
{
    public function __construct(
        private readonly DashboardRefreshSessionHandler $handler,
    ) {}

    public function __invoke(RefreshSessionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $refreshToken = $validated['refresh_token'] ?? null;
        $previousClaim = $validated['claim'] ?? null;

        // The refresh token is validated first; nothing (claim, token row) is revoked for an invalid request.
        $session = is_string($refreshToken)
            ? $this->handler->refresh($refreshToken, is_string($previousClaim) ? $previousClaim : null)
            : null;
        if ($session === null) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_credentials'));
        }

        // D-02: the previous access token row is kept, but expired in the database by the handler (it no longer authenticates).
        return $this->success(data: $session);
    }
}
