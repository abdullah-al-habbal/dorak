<?php

// bootstrap/app.php
declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Modules\Ban\Http\Middleware\EnsureNotBanned;
use Modules\Core\Http\Middleware\AssignRequestUuidMiddleware;
use Modules\Core\Services\ApiExceptionResponseHandler;
use Modules\Core\Services\LoggerService;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(AssignRequestUuidMiddleware::class);
        $middleware->appendToGroup('api', EnsureNotBanned::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
        $exceptions->reportable(function (Throwable $exception): bool {
            app(LoggerService::class)->exception($exception);

            return false;
        });
        $exceptions->respond(function (Response $response): Response {
            return app(ApiExceptionResponseHandler::class)->handle($response, request());
        });
    })->create();
