<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Dashboard\Constants\DashboardLoginConstants;
use Modules\Dashboard\Constants\DashboardPasswordResetConstants;
use Modules\Dashboard\Constants\OwnerRegistrationConstants;
use Modules\Dashboard\Http\Actions\Notifications\ListDashboardNotificationsAction;
use Modules\Dashboard\Http\Actions\Notifications\MarkAllDashboardNotificationsReadAction;
use Modules\Dashboard\Http\Actions\Notifications\MarkDashboardNotificationReadAction;
use Modules\Dashboard\Http\Actions\Owner\CreateOwnerBrandAction;
use Modules\Dashboard\Http\Actions\Owner\RegisterOwnerAction;
use Modules\Dashboard\Http\Actions\Owner\ResendOwnerCodeAction;
use Modules\Dashboard\Http\Actions\Owner\VerifyOwnerEmailAction;
use Modules\Dashboard\Http\Actions\Profile\GetNotificationPreferencesAction;
use Modules\Dashboard\Http\Actions\Profile\GetProfileAction;
use Modules\Dashboard\Http\Actions\Profile\RequestEmailChangeAction;
use Modules\Dashboard\Http\Actions\Profile\UpdateNotificationPreferencesAction;
use Modules\Dashboard\Http\Actions\Profile\UpdatePasswordAction;
use Modules\Dashboard\Http\Actions\Profile\UpdateProfileAction;
use Modules\Dashboard\Http\Actions\Profile\VerifyEmailChangeAction;
use Modules\Dashboard\Http\Actions\Shared\DashboardLoginAction;
use Modules\Dashboard\Http\Actions\Shared\ForgotDashboardPasswordAction;
use Modules\Dashboard\Http\Actions\Shared\LogoutAction;
use Modules\Dashboard\Http\Actions\Shared\MeAction;
use Modules\Dashboard\Http\Actions\Shared\RefreshSessionAction;
use Modules\Dashboard\Http\Actions\Shared\ResetDashboardPasswordAction;
use Modules\Dashboard\Http\Middleware\DashboardAuthorizationMiddleware;
use Modules\Preference\Http\Middleware\ApplyPreferredLocaleMiddleware;

// Public auth, owner sign-up and the routes every signed-in dashboard actor shares. The public routes get the
// language middleware too, so a sign-in form in Arabic gets Arabic validation errors (D5). It is not on the outer
// group: Laravel keeps one copy of a middleware, and the signed-in group needs it after the session check.
Route::prefix('dashboard')->group(function (): void {
    Route::middleware(ApplyPreferredLocaleMiddleware::class)->group(function (): void {
        Route::post('/login', DashboardLoginAction::class)->middleware('throttle:'.DashboardLoginConstants::LOGIN_LIMITER);
        Route::post('/refresh', RefreshSessionAction::class)->middleware('throttle:10,1');
        Route::post('/password/forgot', ForgotDashboardPasswordAction::class)->middleware('throttle:'.DashboardPasswordResetConstants::DASHBOARD_PASSWORD_FORGOT_LIMITER);
        Route::post('/password/reset', ResetDashboardPasswordAction::class)->middleware('throttle:'.DashboardPasswordResetConstants::DASHBOARD_PASSWORD_RESET_LIMITER);

        Route::prefix('owner')->group(function (): void {
            Route::post('/register', RegisterOwnerAction::class)->middleware('throttle:'.OwnerRegistrationConstants::OWNER_REGISTER_LIMITER);
            Route::post('/code/resend', ResendOwnerCodeAction::class)->middleware('throttle:'.OwnerRegistrationConstants::OWNER_REGISTER_LIMITER);
            Route::post('/verify', VerifyOwnerEmailAction::class)->middleware('throttle:'.OwnerRegistrationConstants::OWNER_VERIFY_LIMITER);
            Route::post('/brand', CreateOwnerBrandAction::class)->middleware('throttle:'.DashboardLoginConstants::OWNER_BRAND_LIMITER);
        });
    });

    Route::middleware([DashboardAuthorizationMiddleware::class, ApplyPreferredLocaleMiddleware::class])->group(function (): void {
        Route::get('/me', MeAction::class);
        Route::post('/logout', LogoutAction::class);
        Route::get('/profile', GetProfileAction::class);
        Route::patch('/profile', UpdateProfileAction::class);
        Route::post('/profile/email/change', RequestEmailChangeAction::class)->middleware('throttle:3,1');
        Route::post('/profile/email/verify', VerifyEmailChangeAction::class)->middleware('throttle:5,1');
        Route::put('/profile/password', UpdatePasswordAction::class);
        Route::get('/notifications', ListDashboardNotificationsAction::class);
        Route::post('/notifications/read-all', MarkAllDashboardNotificationsReadAction::class);
        Route::patch('/notifications/{notification}/read', MarkDashboardNotificationReadAction::class)->whereUuid('notification');
        Route::get('/profile/notifications', GetNotificationPreferencesAction::class);
        Route::patch('/profile/notifications', UpdateNotificationPreferencesAction::class);
    });
});
