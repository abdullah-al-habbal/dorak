<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Barber\Http\Middleware\EnsureBarberAccountAccess;
use Modules\Branch\Http\Middleware\EnsureBranchAccountAccess;
use Modules\Dashboard\Http\Actions\Earnings\ShowEarningsAction;
use Modules\Dashboard\Http\Actions\Services\DestroyServiceAction;
use Modules\Dashboard\Http\Actions\Services\ListServicesAction;
use Modules\Dashboard\Http\Actions\Services\ShowServiceAction;
use Modules\Dashboard\Http\Actions\Services\StoreServiceAction;
use Modules\Dashboard\Http\Actions\Services\UpdateServiceAction;
use Modules\Dashboard\Http\Actions\Stylists\ListStylistsAction;
use Modules\Dashboard\Http\Middleware\DashboardEarningsAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\MobileDashboardActorMiddleware;
use Modules\Preference\Http\Middleware\ApplyPreferredLocaleMiddleware;

/*
 * Mobile-scoped entry points (Gap G10/G11) that reuse the dashboard Actions.
 * Tokens keep their `branch-app` / `barber-app` ability; the actor is derived
 * from the authenticated model by MobileDashboardActorMiddleware.
 */
Route::prefix('branch')->name('branch.')->middleware([
    'auth:branch_api',
    EnsureBranchAccountAccess::class,
    ApplyPreferredLocaleMiddleware::class.':branch_api',
    MobileDashboardActorMiddleware::class.':branch_api',
])->group(function (): void {
    Route::get('/services', ListServicesAction::class)->name('services.list');
    Route::post('/services', StoreServiceAction::class)->name('services.create');
    Route::get('/services/{service}', ShowServiceAction::class)->name('services.show');
    Route::put('/services/{service}', UpdateServiceAction::class)->name('services.update');
    Route::delete('/services/{service}', DestroyServiceAction::class)->name('services.delete');
    Route::get('/barbers', ListStylistsAction::class)->name('barbers.list');
    Route::get('/earnings', ShowEarningsAction::class)->name('earnings.show')->middleware(DashboardEarningsAuthorizationMiddleware::class);
});

Route::prefix('barber')->name('barber.')->middleware([
    'auth:barber',
    EnsureBarberAccountAccess::class,
    ApplyPreferredLocaleMiddleware::class.':barber',
    MobileDashboardActorMiddleware::class.':barber',
])->group(function (): void {
    Route::get('/earnings', ShowEarningsAction::class)->name('earnings.show')->middleware(DashboardEarningsAuthorizationMiddleware::class);
});
