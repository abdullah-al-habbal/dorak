<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Activation\Http\Actions\Barber\ActivateBarberAction;
use Modules\Activation\Http\Actions\Barber\DeactivateBarberAction;
use Modules\Barber\Http\Middleware\EnsureBarberAccountAccess;

Route::middleware(['auth:barber', EnsureBarberAccountAccess::class.':approved'])->group(function (): void {
    Route::post('/barbers/{barber}/activate', ActivateBarberAction::class)->name('activation.barber.activate');
    Route::post('/barbers/{barber}/deactivate', DeactivateBarberAction::class)->name('activation.barber.deactivate');
});
