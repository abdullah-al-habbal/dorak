<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Activation\Http\Actions\Admin\ActivateBranchAction;
use Modules\Activation\Http\Actions\Admin\DeactivateBranchAction;
use Modules\Activation\Http\Actions\Business\ActivateAction;
use Modules\Activation\Http\Actions\Business\DeactivateAction;

Route::middleware('auth:admin_api')->prefix('admin')->group(function (): void {
    Route::post('/barbers/{barber}/activate', ActivateAction::class)->name('activation.activate');
    Route::post('/barbers/{barber}/deactivate', DeactivateAction::class)->name('activation.deactivate');
    Route::post('/branches/{branch}/activate', ActivateBranchAction::class)->name('activation.branch.activate');
    Route::post('/branches/{branch}/deactivate', DeactivateBranchAction::class)->name('activation.branch.deactivate');
});
