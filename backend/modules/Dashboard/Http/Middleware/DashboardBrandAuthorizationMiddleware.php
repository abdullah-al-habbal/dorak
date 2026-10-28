<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Modules\Dashboard\Support\DashboardActor;
use Symfony\Component\HttpFoundation\Response;

/** Restricts brand management to platform administrators and brand owners. */
final class DashboardBrandAuthorizationMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var DashboardActor|null $actor */
        $actor = $request->attributes->get('dashboard_actor');

        if ($actor === null || ! ($actor->isPlatformAdmin() || $actor->isBrandOwner())) {
            throw new AuthorizationException(__('dashboard::messages.brand_operation_unavailable'));
        }

        return $next($request);
    }
}
