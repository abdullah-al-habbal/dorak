<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Modules\Dashboard\Support\DashboardActor;
use Symfony\Component\HttpFoundation\Response;

/** Restricts the management API to platform administrators and branch managers. */
final class DashboardOperationsAuthorizationMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var DashboardActor|null $actor */
        $actor = $request->attributes->get('dashboard_actor');

        if ($actor === null || $actor->isBarber()) {
            throw new AuthorizationException('This dashboard operation is not available to barbers.');
        }

        return $next($request);
    }
}
