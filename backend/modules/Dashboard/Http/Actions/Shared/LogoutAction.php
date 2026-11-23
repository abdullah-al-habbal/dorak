<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Shared;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Services\DeviceTokenService;
use Modules\Dashboard\Constants\DashboardSessionConstants;
use Modules\Dashboard\Repositories\DashboardRefreshTokenResolver;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardSessionClaim;

final class LogoutAction extends BaseApiAction
{
    public function __construct(
        private readonly DashboardRefreshTokenResolver $refreshResolver,
        private readonly DashboardSessionClaim $claim,
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $token = $request->attributes->get('dashboard_token');
        // The claim the middleware validated for this very token; the body `claim` is no longer trusted.
        $claim = $request->header(DashboardSessionConstants::DASHBOARD_SESSION_CLAIM_HEADER);
        $this->claim->revokeClaim(is_string($claim) ? $claim : null);

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        $pushToken = $request->input('push_token');
        $account = $request->attributes->get('dashboard_model');
        if (is_string($pushToken) && $pushToken !== '' && $account instanceof Model) {
            $this->deviceTokens->revokeOwnedToken($account, $pushToken);
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
