<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Barber\Http\Middleware\EnsureBarberAccountAccess;
use Modules\OfferedService\Http\Actions\Barber\DestroyBarberServiceAction;
use Modules\OfferedService\Http\Actions\Barber\ListOwnBarberServicesAction;
use Modules\OfferedService\Http\Actions\Barber\StoreBarberServiceAction;
use Modules\OfferedService\Http\Actions\Barber\UpdateBarberServiceAction;
use Modules\Preference\Http\Middleware\ApplyPreferredLocaleMiddleware;

Route::prefix('barber/services')
    ->name('barber.services.')
    ->middleware(['auth:barber', EnsureBarberAccountAccess::class, ApplyPreferredLocaleMiddleware::class.':barber'])
    ->group(function (): void {
        Route::get('/', ListOwnBarberServicesAction::class)->name('index');
        Route::post('/', StoreBarberServiceAction::class)->name('store');
        Route::put('/{service}', UpdateBarberServiceAction::class)->name('update');
        Route::delete('/{service}', DestroyBarberServiceAction::class)->name('destroy');
    });
