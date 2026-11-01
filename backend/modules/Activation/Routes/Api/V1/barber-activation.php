<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Activation\Http\Actions\Barber\ActivateBarberAction;
use Modules\Activation\Http\Actions\Barber\DeactivateBarberAction;
use Modules\Barber\Http\Middleware\EnsureBarberAccountAccess;
use Modules\Core\Enums\AccountAccessScope;

Route::middleware(['auth:barber', EnsureBarberAccountAccess::class.':'.AccountAccessScope::Approved->value])->group(function (): void {
    Route::post('/barbers/{barber}/activate', ActivateBarberAction::class)->name('activation.barber.activate');
    Route::post('/barbers/{barber}/deactivate', DeactivateBarberAction::class)->name('activation.barber.deactivate');
});
