<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Barber\Http\Actions\Barber\DeletePortfolioPhotoAction;
use Modules\Barber\Http\Actions\Barber\ForgotPasswordAction;
use Modules\Barber\Http\Actions\Barber\GetProfileAction;
use Modules\Barber\Http\Actions\Barber\GetScheduleAction;
use Modules\Barber\Http\Actions\Barber\ListAppointmentsAction;
use Modules\Barber\Http\Actions\Barber\ListPortfolioAction;
use Modules\Barber\Http\Actions\Barber\LoginAction;
use Modules\Barber\Http\Actions\Barber\LogoutAction;
use Modules\Barber\Http\Actions\Barber\RefreshTokenAction;
use Modules\Barber\Http\Actions\Barber\RegisterAction;
use Modules\Barber\Http\Actions\Barber\ResetPasswordAction;
use Modules\Barber\Http\Actions\Barber\SendEmailVerificationAction;
use Modules\Barber\Http\Actions\Barber\TodayAppointmentsAction;
use Modules\Barber\Http\Actions\Barber\UpdateProfileAction;
use Modules\Barber\Http\Actions\Barber\UpdateScheduleAction;
use Modules\Barber\Http\Actions\Barber\UpdateTravelRadiusAction;
use Modules\Barber\Http\Actions\Barber\UpdateWorkstationStatusAction;
use Modules\Barber\Http\Actions\Barber\UploadPortfolioAction;
use Modules\Barber\Http\Actions\Barber\VerifyEmailAction;
use Modules\Barber\Http\Middleware\EnsureBarberAccountAccess;
use Modules\Booking\Http\Actions\Barber\AcceptBookingAction;
use Modules\Booking\Http\Actions\Barber\CancelBookingAction;
use Modules\Booking\Http\Actions\Barber\CompleteBookingAction;
use Modules\Booking\Http\Actions\Barber\NoShowBookingAction;
use Modules\Booking\Http\Actions\Barber\StartBookingAction;
use Modules\Core\Enums\AccountAccessScope;
use Modules\Preference\Http\Middleware\ApplyPreferredLocaleMiddleware;

Route::prefix('barber')->name('barber.')->group(function (): void {
    Route::post('/login', LoginAction::class)->name('login')->middleware('throttle:5,1');

    Route::post('/register', RegisterAction::class)->name('register')->middleware('throttle:5,1');
    Route::post('/forgot-password', ForgotPasswordAction::class)->name('forgot-password')->middleware('throttle:5,1');
    Route::post('/reset-password', ResetPasswordAction::class)->name('reset-password')->middleware('throttle:5,1');

    Route::middleware(['auth:barber', EnsureBarberAccountAccess::class.':'.AccountAccessScope::Onboarding->value, ApplyPreferredLocaleMiddleware::class.':barber'])->group(function (): void {
        Route::get('/profile', GetProfileAction::class)->name('profile.show');
        Route::post('/logout', LogoutAction::class)->name('logout');
        Route::post('/email/verify/send', SendEmailVerificationAction::class)->name('email.verify.send')->middleware('throttle:3,1');
        Route::post('/email/verify', VerifyEmailAction::class)->name('email.verify')->middleware('throttle:5,1');
    });

    Route::middleware(['auth:barber', EnsureBarberAccountAccess::class, ApplyPreferredLocaleMiddleware::class.':barber'])->group(function (): void {
        Route::post('/refresh-token', RefreshTokenAction::class)->name('refresh-token')->middleware('throttle:5,1');
        Route::patch('/profile', UpdateProfileAction::class)->name('profile.update');
        Route::post('/portfolio', UploadPortfolioAction::class)->name('portfolio.upload');
        Route::get('/portfolio', ListPortfolioAction::class)->name('portfolio.list');
        Route::delete('/portfolio/{photo}', DeletePortfolioPhotoAction::class)->name('portfolio.delete');
        Route::patch('/travel-radius', UpdateTravelRadiusAction::class)->name('travel-radius.update');
        Route::get('/schedule', GetScheduleAction::class)->name('schedule.show');
        Route::patch('/schedule', UpdateScheduleAction::class)->name('schedule.update');
        Route::get('/appointments', ListAppointmentsAction::class)->name('appointments.list');
        Route::get('/appointments/today', TodayAppointmentsAction::class)->name('appointments.today');
        Route::patch('/workstation-status', UpdateWorkstationStatusAction::class)->name('workstation.status');
        Route::patch('/bookings/{booking}/accept', AcceptBookingAction::class)->name('bookings.accept');
        Route::patch('/bookings/{booking}/start', StartBookingAction::class)->name('bookings.start');
        Route::patch('/bookings/{booking}/complete', CompleteBookingAction::class)->name('bookings.complete');
        Route::patch('/bookings/{booking}/no-show', NoShowBookingAction::class)->name('bookings.no-show');
        Route::post('/bookings/{booking}/cancel', CancelBookingAction::class)->name('bookings.cancel');
    });
});
