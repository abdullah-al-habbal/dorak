<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\JobPosting\Http\Actions\Barber\ListApplicationsAction;

Route::middleware('auth:barber')->group(function (): void {
    Route::get('/applications', ListApplicationsAction::class)->name('applications.list');
});
