<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Modules\Dashboard\Support\DashboardActor;
use Symfony\Component\HttpFoundation\Response;

/** Restricts earnings to brand owners, branch managers and stylists (platform admins use analytics). */
final class DashboardEarningsAuthorizationMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var DashboardActor|null $actor */
        $actor = $request->attributes->get('dashboard_actor');

        if ($actor === null || $actor->isPlatformAdmin()) {
            throw new AuthorizationException(__('dashboard::messages.earnings_operation_unavailable'));
        }

        return $next($request);
    }
}
