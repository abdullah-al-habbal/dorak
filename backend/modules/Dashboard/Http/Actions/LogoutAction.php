<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Repositories\DashboardRefreshTokenResolver;
use Modules\Dashboard\Support\DashboardActor;

final class LogoutAction extends BaseApiAction
{
    public function __construct(
        private readonly DashboardRefreshTokenResolver $refreshResolver,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $token = $request->attributes->get('dashboard_token');

        if ($token !== null) {
            $token->delete();
        }

        $providedRefreshToken = $request->input('refresh_token');
        if (is_string($providedRefreshToken) && $providedRefreshToken !== '') {
            $this->refreshResolver->revoke($providedRefreshToken);
        } else {
            $this->refreshResolver->revokeForActor($actor);
        }

        return $this->success(data: ['logged_out' => true]);
    }
}
