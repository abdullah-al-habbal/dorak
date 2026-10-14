<?php

declare(strict_types=1);

namespace Modules\Core\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

final class AssignRequestUuidMiddleware
{
    public function handle(Request $request, Closure $next): mixed
    {
        $providedUuid = $request->header('X-Request-ID');
        $uuid = is_string($providedUuid) && Str::isUuid($providedUuid)
            ? strtolower($providedUuid)
            : Str::uuid()->toString();
        $request->attributes->set('request_uuid', $uuid);
        $request->merge(['request_uuid' => $uuid]);
        Log::withoutContext();
        Log::withContext(['uuid' => $uuid]);

        try {
            $response = $next($request);
            if ($response instanceof Response) {
                $response->headers->set('X-Request-ID', $uuid);
            }

            return $response;
        } finally {
            Log::withoutContext();
        }
    }
}
