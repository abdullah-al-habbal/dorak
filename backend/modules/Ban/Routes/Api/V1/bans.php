<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Ban\Http\Actions\Api\V1\Client\CheckClientBanAction;

Route::middleware('auth:client')->group(function (): void {
    Route::get('/clients/{client}/bans/check', CheckClientBanAction::class)->name('clients.bans.check');
});
