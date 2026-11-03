<?php

declare(strict_types=1);

namespace Modules\Core\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\Core\Enums\TokenAbility;

/**
 * Keeps scoped Sanctum tokens on their own API surface: dashboard session
 * tokens only reach the dashboard (plus realtime auth and the notification inbox), mobile-app tokens never
 * reach the dashboard. Wildcard tokens and unauthenticated requests pass.
 */
final class EnforceTokenScope
{
    private const DASHBOARD_PATTERN = 'api/v1/dashboard/*';

    private const DASHBOARD_SHARED_PATHS = ['api/v1/broadcasting/auth', 'api/v1/notifications', 'api/v1/notifications/*'];

    public function handle(Request $request, Closure $next): mixed
    {
        $token = $this->currentToken($request);

        if ($token === null || $this->allows($token, $request)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'statusCode' => 403,
            'code' => 'TOKEN_ABILITY_MISSING',
            'message' => trans('core::messages.token_ability_missing'),
            'timestamp' => now()->toIso8601String(),
        ], 403);
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
