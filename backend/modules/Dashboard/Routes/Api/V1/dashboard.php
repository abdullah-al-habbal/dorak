<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Dashboard\Http\Actions\Branches\DestroyBranchAction;
use Modules\Dashboard\Http\Actions\Branches\ListBranchesAction;
use Modules\Dashboard\Http\Actions\Branches\ShowBranchAction;
use Modules\Dashboard\Http\Actions\Branches\StoreBranchAction;
use Modules\Dashboard\Http\Actions\Branches\UpdateBranchAction;
use Modules\Dashboard\Http\Actions\CancelBookingAction;
use Modules\Dashboard\Http\Actions\Chairs\DestroyChairAction;
use Modules\Dashboard\Http\Actions\Chairs\ListChairsAction;
use Modules\Dashboard\Http\Actions\Chairs\ShowChairAction;
use Modules\Dashboard\Http\Actions\Chairs\StoreChairAction;
use Modules\Dashboard\Http\Actions\Chairs\UpdateChairAction;
use Modules\Dashboard\Http\Actions\CreateWalkInBookingAction;
use Modules\Dashboard\Http\Actions\DashboardLoginAction;
use Modules\Dashboard\Http\Actions\ListBookingsAction;
use Modules\Dashboard\Http\Actions\LogoutAction;
use Modules\Dashboard\Http\Actions\MeAction;
use Modules\Dashboard\Http\Actions\OverviewAction;
use Modules\Dashboard\Http\Actions\Profile\GetNotificationPreferencesAction;
use Modules\Dashboard\Http\Actions\Profile\GetProfileAction;
use Modules\Dashboard\Http\Actions\Profile\RequestEmailChangeAction;
use Modules\Dashboard\Http\Actions\Profile\UpdateNotificationPreferencesAction;
use Modules\Dashboard\Http\Actions\Profile\UpdatePasswordAction;
use Modules\Dashboard\Http\Actions\Profile\UpdateProfileAction;
use Modules\Dashboard\Http\Actions\Profile\VerifyEmailChangeAction;
use Modules\Dashboard\Http\Actions\RefreshSessionAction;
use Modules\Dashboard\Http\Actions\RescheduleBookingAction;
use Modules\Dashboard\Http\Actions\ReviewBookingClientAction;
use Modules\Dashboard\Http\Actions\Services\DestroyServiceAction;
use Modules\Dashboard\Http\Actions\Services\ListServicesAction;
use Modules\Dashboard\Http\Actions\Services\ShowServiceAction;
use Modules\Dashboard\Http\Actions\Services\StoreServiceAction;
use Modules\Dashboard\Http\Actions\Services\UpdateServiceAction;
use Modules\Dashboard\Http\Actions\ShowBookingAction;
use Modules\Dashboard\Http\Actions\Stylists\DestroyStylistAction;
use Modules\Dashboard\Http\Actions\Stylists\ListStylistsAction;
use Modules\Dashboard\Http\Actions\Stylists\ShowStylistAction;
use Modules\Dashboard\Http\Actions\Stylists\StoreStylistAction;
use Modules\Dashboard\Http\Actions\Stylists\UpdateStylistAction;
use Modules\Dashboard\Http\Actions\UpdateBookingStatusAction;
use Modules\Dashboard\Http\Middleware\DashboardAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\DashboardOperationsAuthorizationMiddleware;

Route::prefix('dashboard')->group(function (): void {
    Route::post('/login', DashboardLoginAction::class)->middleware('throttle:5,1');
    Route::post('/refresh', RefreshSessionAction::class)->middleware('throttle:10,1');

    Route::middleware(DashboardAuthorizationMiddleware::class)->group(function (): void {
        Route::get('/me', MeAction::class);
        Route::post('/logout', LogoutAction::class);
        Route::get('/profile', GetProfileAction::class);
        Route::patch('/profile', UpdateProfileAction::class);
        Route::post('/profile/email/change', RequestEmailChangeAction::class)->middleware('throttle:3,1');
        Route::post('/profile/email/verify', VerifyEmailChangeAction::class)->middleware('throttle:5,1');
        Route::put('/profile/password', UpdatePasswordAction::class);
        Route::get('/profile/notifications', GetNotificationPreferencesAction::class);
        Route::patch('/profile/notifications', UpdateNotificationPreferencesAction::class);
    });

    Route::middleware([DashboardAuthorizationMiddleware::class, DashboardOperationsAuthorizationMiddleware::class])->group(function (): void {
        Route::get('/overview', OverviewAction::class);
        Route::get('/bookings', ListBookingsAction::class);
        Route::post('/bookings/walk-in', CreateWalkInBookingAction::class);
        Route::get('/bookings/{booking}', ShowBookingAction::class);
        Route::patch('/bookings/{booking}', UpdateBookingStatusAction::class);
        Route::patch('/bookings/{booking}/cancel', CancelBookingAction::class);
        Route::patch('/bookings/{booking}/reschedule', RescheduleBookingAction::class);
        Route::post('/bookings/{booking}/review', ReviewBookingClientAction::class);
        Route::get('/branches', ListBranchesAction::class);
        Route::get('/branches/{branch}', ShowBranchAction::class);
        Route::post('/branches', StoreBranchAction::class);
        Route::put('/branches/{branch}', UpdateBranchAction::class);
        Route::delete('/branches/{branch}', DestroyBranchAction::class);
        Route::get('/services', ListServicesAction::class);
        Route::post('/services', StoreServiceAction::class);
        Route::get('/services/{service}', ShowServiceAction::class);
        Route::put('/services/{service}', UpdateServiceAction::class);
        Route::delete('/services/{service}', DestroyServiceAction::class);
        Route::get('/chairs', ListChairsAction::class);
        Route::post('/chairs', StoreChairAction::class);
        Route::get('/chairs/{chair}', ShowChairAction::class);
        Route::put('/chairs/{chair}', UpdateChairAction::class);
        Route::delete('/chairs/{chair}', DestroyChairAction::class);
        Route::get('/stylists', ListStylistsAction::class);
        Route::post('/stylists', StoreStylistAction::class);
        Route::get('/stylists/{stylist}', ShowStylistAction::class);
        Route::put('/stylists/{stylist}', UpdateStylistAction::class);
        Route::delete('/stylists/{stylist}', DestroyStylistAction::class);
    });
});
