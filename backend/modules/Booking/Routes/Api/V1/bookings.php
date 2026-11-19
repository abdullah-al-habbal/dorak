<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Booking\Constants\BookingConstants;
use Modules\Booking\Http\Actions\Client\CancelBookingAction;
use Modules\Booking\Http\Actions\Client\CreateBookingAction;
use Modules\Booking\Http\Actions\Client\ListUserBookingsAction;
use Modules\Booking\Http\Actions\Client\ShowBookingAction;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;

Route::middleware(['auth:client', EnsureClientAccountAccess::class])->group(function (): void {
    Route::middleware('throttle:'.BookingConstants::BOOKING_WRITE_LIMITER)->group(function (): void {
        Route::post('/bookings', CreateBookingAction::class)->name('bookings.create');
        Route::post('/client/bookings/{booking}/cancel', CancelBookingAction::class)->name('bookings.cancel');
    });
    Route::middleware('throttle:'.BookingConstants::BOOKING_READ_LIMITER)->group(function (): void {
        Route::get('/bookings', ListUserBookingsAction::class)->name('bookings.list');
        Route::get('/bookings/{booking}', ShowBookingAction::class)->name('bookings.show');
    });
});
