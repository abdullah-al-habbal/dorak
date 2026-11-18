<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Barber\Http\Middleware\EnsureBarberAccountAccess;
use Modules\Branch\Http\Middleware\EnsureBranchAccountAccess;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;
use Modules\Dashboard\Http\Actions\Branches\ListBranchesAction;
use Modules\Dashboard\Http\Actions\Branches\ShowBranchAction;
use Modules\Dashboard\Http\Actions\Branches\StoreBranchAction;
use Modules\Dashboard\Http\Actions\Branches\UpdateBranchAction;
use Modules\Dashboard\Http\Actions\BranchLifecycle\SwitchBranchAction;
use Modules\Dashboard\Http\Actions\Brands\ListBrandsAction;
use Modules\Dashboard\Http\Actions\Brands\ShowBrandAction;
use Modules\Dashboard\Http\Actions\Brands\UpdateBrandAction;
use Modules\Dashboard\Http\Actions\Brands\UploadBrandLogoAction;
use Modules\Dashboard\Http\Actions\Earnings\ShowEarningsAction;
use Modules\Dashboard\Http\Actions\Owner\OwnerMobileMeAction;
use Modules\Dashboard\Http\Actions\Owner\ResubmitBrandAction;
use Modules\Dashboard\Http\Actions\Services\DestroyServiceAction;
use Modules\Dashboard\Http\Actions\Services\ListServicesAction;
use Modules\Dashboard\Http\Actions\Services\ShowServiceAction;
use Modules\Dashboard\Http\Actions\Services\StoreServiceAction;
use Modules\Dashboard\Http\Actions\Services\UpdateServiceAction;
use Modules\Dashboard\Http\Actions\Stylists\ListStylistsAction;
use Modules\Dashboard\Http\Actions\Stylists\ShowStylistAction;
use Modules\Dashboard\Http\Middleware\DashboardBrandAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\DashboardEarningsAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\DashboardOperationsAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\DashboardOwnerAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\MobileDashboardActorMiddleware;
use Modules\Payout\Http\Actions\Owner\ListOwnerPayoutsAction;
use Modules\Preference\Http\Middleware\ApplyPreferredLocaleMiddleware;
use Modules\Subscription\Http\Actions\Owner\ListOwnerSubscriptionsAction;

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

/*
 * Brand owner (ADR 0001: a client account with a brand). The client token keeps its
 * `client-active` ability; the owner actor is rebuilt from the account on every
 * request, so the brand, branch and D11 limits of the dashboard apply unchanged and
 * a mobile token can never call `dashboard/*`. Owner registration stays on the web.
 */
Route::prefix('owner')->name('owner.')->group(function (): void {
    // Open to any active client: it is how the app learns whether this account owns a brand.
    Route::get('/me', OwnerMobileMeAction::class)
        ->middleware(['auth:client', EnsureClientAccountAccess::class, ApplyPreferredLocaleMiddleware::class.':client'])
        ->name('me');

    Route::middleware([
        'auth:client',
        EnsureClientAccountAccess::class,
        ApplyPreferredLocaleMiddleware::class.':client',
        MobileDashboardActorMiddleware::class.':client',
    ])->group(function (): void {
        Route::middleware(DashboardBrandAuthorizationMiddleware::class)->group(function (): void {
            Route::get('/brands', ListBrandsAction::class)->name('brands.list');
            Route::post('/brands/logo', UploadBrandLogoAction::class)->name('brands.logo');
            Route::get('/brands/{brand}', ShowBrandAction::class)->name('brands.show');
            Route::put('/brands/{brand}', UpdateBrandAction::class)->name('brands.update');
            Route::post('/brands/{brand}/resubmit', ResubmitBrandAction::class)->name('brands.resubmit');
            Route::patch('/branches/{branch}/switch-on', SwitchBranchAction::class)->defaults('on', true)->name('branches.switch-on');
            Route::patch('/branches/{branch}/switch-off', SwitchBranchAction::class)->defaults('on', false)->name('branches.switch-off');
        });

        Route::middleware(DashboardOwnerAuthorizationMiddleware::class)->group(function (): void {
            Route::get('/subscription', ListOwnerSubscriptionsAction::class)->name('subscription.list');
            Route::get('/payouts', ListOwnerPayoutsAction::class)->name('payouts.list');
        });

        Route::middleware(DashboardOperationsAuthorizationMiddleware::class)->group(function (): void {
            Route::get('/branches', ListBranchesAction::class)->name('branches.list');
            Route::post('/branches', StoreBranchAction::class)->name('branches.create');
            Route::get('/branches/{branch}', ShowBranchAction::class)->name('branches.show');
            Route::put('/branches/{branch}', UpdateBranchAction::class)->name('branches.update');
            Route::get('/services', ListServicesAction::class)->name('services.list');
            Route::post('/services', StoreServiceAction::class)->name('services.create');
            Route::get('/services/{service}', ShowServiceAction::class)->name('services.show');
            Route::put('/services/{service}', UpdateServiceAction::class)->name('services.update');
            Route::delete('/services/{service}', DestroyServiceAction::class)->name('services.delete');
            Route::get('/stylists', ListStylistsAction::class)->name('stylists.list');
            Route::get('/stylists/{stylist}', ShowStylistAction::class)->name('stylists.show');
            Route::get('/earnings', ShowEarningsAction::class)->name('earnings.show')->middleware(DashboardEarningsAuthorizationMiddleware::class);
        });
    });
});
