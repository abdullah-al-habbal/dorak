<?php

declare(strict_types=1);

namespace Modules\Core\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Enums\TokenAbility;
use Modules\Core\Helpers\ApiResponseTrait;

final class EnforceTokenScope
{
    use ApiResponseTrait;

    private const DASHBOARD_PATTERN = 'api/v1/dashboard/*';

    private const DASHBOARD_SHARED_PATHS = ['api/v1/broadcasting/auth', 'api/v1/notifications', 'api/v1/notifications/*'];

    public function handle(Request $request, Closure $next): mixed
    {
        $token = $this->currentToken($request);

        if ($token === null || $this->allows($token, $request)) {
            return $next($request);
        }

        return $this->error(ErrorCodeEnum::TOKEN_ABILITY_MISSING);
    }

    private function currentToken(Request $request): ?PersonalAccessToken
    {
        $user = $request->user();
        $token = is_object($user) && method_exists($user, 'currentAccessToken')
            ? $user->currentAccessToken()
            : null;

        return $token instanceof PersonalAccessToken ? $token : null;
    }

    private function allows(PersonalAccessToken $token, Request $request): bool
    {
        if ($request->is(self::DASHBOARD_PATTERN)) {
            return $token->can(TokenAbility::Dashboard->value);
        }

        if ($token->can(TokenAbility::Dashboard->value) && $request->is(...self::DASHBOARD_SHARED_PATHS)) {
            return true;
        }

        foreach (TokenAbility::mobileApp() as $ability) {
            if ($token->can($ability)) {
                return true;
            }
        }

        return false;
    }
}
