<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Modules\Dashboard\Support\DashboardActor;
use Symfony\Component\HttpFoundation\Response;

/** Restricts a route to barbers (their own schedule); the Operations group rejects barbers, so this is its mirror. */
final class DashboardBarberAuthorizationMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var DashboardActor|null $actor */
        $actor = $request->attributes->get('dashboard_actor');

        if ($actor === null || ! $actor->isBarber()) {
            throw new AuthorizationException(__('dashboard::messages.barber_operation_only'));
        }

        return $next($request);
    }
}
