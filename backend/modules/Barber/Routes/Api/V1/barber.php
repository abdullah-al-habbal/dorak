<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Barber\Http\Actions\Barber\DeletePortfolioPhotoAction;
use Modules\Barber\Http\Actions\Barber\GetProfileAction;
use Modules\Barber\Http\Actions\Barber\GetScheduleAction;
use Modules\Barber\Http\Actions\Barber\ListPortfolioAction;
use Modules\Barber\Http\Actions\Barber\LoginAction;
use Modules\Barber\Http\Actions\Barber\TodayAppointmentsAction;
use Modules\Barber\Http\Actions\Barber\UpdateProfileAction;
use Modules\Barber\Http\Actions\Barber\UpdateScheduleAction;
use Modules\Barber\Http\Actions\Barber\UpdateTravelRadiusAction;
use Modules\Barber\Http\Actions\Barber\UpdateWorkstationStatusAction;
use Modules\Barber\Http\Actions\Barber\UploadPortfolioAction;
use Modules\Booking\Http\Actions\Barber\AcceptBookingAction;
use Modules\Booking\Http\Actions\Barber\CancelBookingAction;
use Modules\Booking\Http\Actions\Barber\CompleteBookingAction;
use Modules\Booking\Http\Actions\Barber\NoShowBookingAction;
use Modules\Booking\Http\Actions\Barber\StartBookingAction;

Route::prefix('barber')->name('barber.')->group(function (): void {
    Route::post('/login', LoginAction::class)->name('login');

    Route::middleware('auth:barber')->group(function (): void {
        Route::get('/profile', GetProfileAction::class)->name('profile.show');
        Route::patch('/profile', UpdateProfileAction::class)->name('profile.update');
        Route::post('/portfolio', UploadPortfolioAction::class)->name('portfolio.upload');
        Route::get('/portfolio', ListPortfolioAction::class)->name('portfolio.list');
        Route::delete('/portfolio/{photo}', DeletePortfolioPhotoAction::class)->name('portfolio.delete');
        Route::patch('/travel-radius', UpdateTravelRadiusAction::class)->name('travel-radius.update');
        Route::get('/schedule', GetScheduleAction::class)->name('schedule.show');
        Route::patch('/schedule', UpdateScheduleAction::class)->name('schedule.update');
        Route::get('/appointments/today', TodayAppointmentsAction::class)->name('appointments.today');
        Route::patch('/workstation-status', UpdateWorkstationStatusAction::class)->name('workstation.status');
        Route::patch('/bookings/{booking}/accept', AcceptBookingAction::class)->name('bookings.accept');
        Route::patch('/bookings/{booking}/start', StartBookingAction::class)->name('bookings.start');
        Route::patch('/bookings/{booking}/complete', CompleteBookingAction::class)->name('bookings.complete');
        Route::patch('/bookings/{booking}/no-show', NoShowBookingAction::class)->name('bookings.no-show');
        Route::post('/bookings/{booking}/cancel', CancelBookingAction::class)->name('bookings.cancel');
    });
});
