<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Activation\Http\Actions\Branch\ActivateManagedBarberAction;
use Modules\Activation\Http\Actions\Branch\DeactivateManagedBarberAction;
use Modules\Branch\Http\Middleware\EnsureBranchAccountAccess;

Route::middleware(['auth:branch_api', EnsureBranchAccountAccess::class])->prefix('branch')->group(function (): void {
    Route::post('/barbers/{barber}/activate', ActivateManagedBarberAction::class)->name('activation.branch.barber.activate');
    Route::post('/barbers/{barber}/deactivate', DeactivateManagedBarberAction::class)->name('activation.branch.barber.deactivate');
});
