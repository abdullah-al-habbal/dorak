<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Barber\Http\Middleware\EnsureBarberAccountAccess;
use Modules\BarberAffiliation\Http\Actions\Barber\AcceptAffiliationAction;
use Modules\BarberAffiliation\Http\Actions\Barber\CreateAffiliationAction;
use Modules\BarberAffiliation\Http\Actions\Barber\ListBarberAffiliationsAction;
use Modules\BarberAffiliation\Http\Actions\Barber\RejectAffiliationAction;
use Modules\BarberAffiliation\Http\Actions\Barber\TerminateAffiliationAction;

Route::middleware(['auth:barber', EnsureBarberAccountAccess::class])->group(function (): void {
    Route::post('/barbers/{barber}/affiliate', CreateAffiliationAction::class)->name('affiliations.create');
    Route::post('/affiliations/{affiliation}/accept', AcceptAffiliationAction::class)->name('affiliations.accept');
    Route::post('/affiliations/{affiliation}/reject', RejectAffiliationAction::class)->name('affiliations.reject');
    Route::post('/affiliations/{affiliation}/terminate', TerminateAffiliationAction::class)->name('affiliations.terminate');
    Route::get('/barbers/{barber}/affiliations', ListBarberAffiliationsAction::class)->name('affiliations.list');
});
