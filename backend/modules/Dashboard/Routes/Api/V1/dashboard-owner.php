<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Dashboard\Http\Actions\Barbers\DestroyBarberServiceOverrideAction;
use Modules\Dashboard\Http\Actions\Barbers\ListBarberServiceOverridesAction;
use Modules\Dashboard\Http\Actions\Barbers\UpsertBarberServiceOverrideAction;
use Modules\Dashboard\Http\Actions\BranchLifecycle\SwitchBranchAction;
use Modules\Dashboard\Http\Actions\Brands\ListBrandsAction;
use Modules\Dashboard\Http\Actions\Brands\ShowBrandAction;
use Modules\Dashboard\Http\Actions\Brands\StoreBrandAction;
use Modules\Dashboard\Http\Actions\Brands\UpdateBrandAction;
use Modules\Dashboard\Http\Actions\Brands\UploadBrandLogoAction;
use Modules\Dashboard\Http\Actions\Earnings\ShowEarningsAction;
use Modules\Dashboard\Http\Actions\Owner\ResubmitBrandAction;
use Modules\Dashboard\Http\Actions\Schedule\ListScheduleAppointmentsAction;
use Modules\Dashboard\Http\Actions\Schedule\ListScheduleHoursAction;
use Modules\Dashboard\Http\Middleware\DashboardAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\DashboardBarberAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\DashboardBrandAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\DashboardEarningsAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\DashboardOwnerAuthorizationMiddleware;
use Modules\Payout\Http\Actions\Owner\ListOwnerPayoutsAction;
use Modules\Preference\Http\Middleware\ApplyPreferredLocaleMiddleware;
use Modules\Subscription\Http\Actions\Owner\ListOwnerSubscriptionsAction;

// Earnings, schedule, owner and brand-management routes.
Route::prefix('dashboard')->group(function (): void {
    Route::middleware([DashboardAuthorizationMiddleware::class, DashboardEarningsAuthorizationMiddleware::class, ApplyPreferredLocaleMiddleware::class])->group(function (): void {
        Route::get('/earnings', ShowEarningsAction::class);
    });

    Route::middleware([DashboardAuthorizationMiddleware::class, DashboardBarberAuthorizationMiddleware::class, ApplyPreferredLocaleMiddleware::class])->prefix('schedule')->group(function (): void {
        Route::get('/appointments', ListScheduleAppointmentsAction::class);
        Route::get('/hours', ListScheduleHoursAction::class);
    });

    Route::middleware([DashboardAuthorizationMiddleware::class, DashboardOwnerAuthorizationMiddleware::class, ApplyPreferredLocaleMiddleware::class])->group(function (): void {
        Route::get('/subscription', ListOwnerSubscriptionsAction::class);
        Route::get('/payouts', ListOwnerPayoutsAction::class);
    });

    Route::middleware([DashboardAuthorizationMiddleware::class, DashboardBrandAuthorizationMiddleware::class, ApplyPreferredLocaleMiddleware::class])->group(function (): void {
        Route::get('/brands', ListBrandsAction::class);
        Route::post('/brands', StoreBrandAction::class);
        Route::post('/brands/logo', UploadBrandLogoAction::class);
        Route::get('/brands/{brand}', ShowBrandAction::class);
        Route::put('/brands/{brand}', UpdateBrandAction::class);
        Route::post('/brands/{brand}/resubmit', ResubmitBrandAction::class);
        Route::patch('/branches/{branch}/switch-on', SwitchBranchAction::class)->defaults('on', true);
        Route::patch('/branches/{branch}/switch-off', SwitchBranchAction::class)->defaults('on', false);
        Route::get('/barbers/{barber}/services', ListBarberServiceOverridesAction::class);
        Route::put('/barbers/{barber}/services/{service}/override', UpsertBarberServiceOverrideAction::class);
        Route::delete('/barbers/{barber}/services/{service}/override', DestroyBarberServiceOverrideAction::class);
    });
});
