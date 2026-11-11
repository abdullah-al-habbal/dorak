<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/** NS-28: the Filament panels are retired, so no web route may serve a panel under /admin, /branch or /barber. */
describe('Retired Filament panels', function (): void {
    it('registers no route under the old panel paths', function (string $prefix): void {
        $uris = collect(Route::getRoutes()->getRoutes())
            ->map(fn ($route): string => $route->uri())
            ->filter(fn (string $uri): bool => $uri === $prefix || str_starts_with($uri, $prefix.'/'));

        expect($uris->all())->toBe([]);
    })->with(['admin', 'branch', 'barber']);

    it('answers 404 for the old panel entry points', function (string $path): void {
        $this->get($path)->assertNotFound();
    })->with(['/admin', '/admin/brands', '/branch', '/barber', '/admin/login']);
});
