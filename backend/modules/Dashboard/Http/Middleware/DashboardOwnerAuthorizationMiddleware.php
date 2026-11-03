<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Modules\Dashboard\Support\DashboardActor;
use Symfony\Component\HttpFoundation\Response;

/** Restricts a route to brand owners (their plan and payouts). */
final class DashboardOwnerAuthorizationMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var DashboardActor|null $actor */
        $actor = $request->attributes->get('dashboard_actor');

        if ($actor === null || ! $actor->isBrandOwner()) {
            throw new AuthorizationException(__('dashboard::messages.owner_operation_only'));
        }

        return $next($request);
    }
}
