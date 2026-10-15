<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Booking\Http\Actions\Shared\ListBarberSlotsAction;
use Modules\Booking\Http\Actions\Shared\ListBranchSlotsAction;

Route::get('/branches/{branch}/slots', ListBranchSlotsAction::class)->name('branches.slots');
Route::get('/barbers/{barber}/slots', ListBarberSlotsAction::class)->name('barbers.slots');
