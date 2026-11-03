<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Barber\Http\Middleware\EnsureBarberAccountAccess;
use Modules\Branch\Http\Middleware\EnsureBranchAccountAccess;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;
use Modules\Dashboard\Http\Middleware\DashboardAuthorizationMiddleware;
use Modules\Preference\Http\Actions\Barber\GetSettingsAction as BarberGetSettingsAction;
use Modules\Preference\Http\Actions\Barber\UpdateSettingsAction as BarberUpdateSettingsAction;
use Modules\Preference\Http\Actions\Branch\GetSettingsAction as BranchGetSettingsAction;
use Modules\Preference\Http\Actions\Branch\UpdateSettingsAction as BranchUpdateSettingsAction;
use Modules\Preference\Http\Actions\Client\GetSettingsAction as ClientGetSettingsAction;
use Modules\Preference\Http\Actions\Client\UpdateSettingsAction as ClientUpdateSettingsAction;
use Modules\Preference\Http\Actions\Dashboard\GetSettingsAction as DashboardGetSettingsAction;
use Modules\Preference\Http\Actions\Dashboard\UpdateSettingsAction as DashboardUpdateSettingsAction;

Route::middleware(['auth:client', EnsureClientAccountAccess::class])->group(function (): void {
    Route::get('/client/settings', ClientGetSettingsAction::class)->name('client.settings.show');
    Route::patch('/client/settings', ClientUpdateSettingsAction::class)->name('client.settings.update');
});

Route::middleware(['auth:barber', EnsureBarberAccountAccess::class])->group(function (): void {
    Route::get('/barber/settings', BarberGetSettingsAction::class)->name('barber.settings.show');
    Route::patch('/barber/settings', BarberUpdateSettingsAction::class)->name('barber.settings.update');
});

Route::middleware(['auth:branch_api', EnsureBranchAccountAccess::class])->group(function (): void {
    Route::get('/branch/settings', BranchGetSettingsAction::class)->name('branch.settings.show');
    Route::patch('/branch/settings', BranchUpdateSettingsAction::class)->name('branch.settings.update');
});

Route::prefix('dashboard')->group(function (): void {
    Route::middleware(DashboardAuthorizationMiddleware::class)->group(function (): void {
        Route::get('/settings', DashboardGetSettingsAction::class)->name('dashboard.settings.show');
        Route::patch('/settings', DashboardUpdateSettingsAction::class)->name('dashboard.settings.update');
    });
});
