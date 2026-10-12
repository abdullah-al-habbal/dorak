<?php

declare(strict_types=1);

namespace Modules\Ban\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Ban\Http\Responses\AccountBannedResponse;
use Modules\Barber\Models\BarberModel;
use Modules\Client\Models\ClientModel;

final class EnsureNotBanned
{
    public function handle(Request $request, Closure $next): mixed
    {
        if ($request->routeIs('api.v1.clients.bans.check')) {
            return $next($request);
        }

        foreach (['client', 'barber'] as $guard) {
            $actor = Auth::guard($guard)->user();

            if ($actor instanceof ClientModel && $actor->isBanned()) {
                return AccountBannedResponse::make();
            }

            if ($actor instanceof BarberModel && $actor->isBanned()) {
                return AccountBannedResponse::make();
            }
        }

        return $next($request);
    }
}
