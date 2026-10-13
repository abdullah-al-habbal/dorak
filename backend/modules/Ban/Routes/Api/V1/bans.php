<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Ban\Http\Actions\Api\V1\Client\CheckClientBanAction;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;

Route::middleware(['auth:client', EnsureClientAccountAccess::class])->group(function (): void {
    Route::get('/clients/{client}/bans/check', CheckClientBanAction::class)->name('clients.bans.check');
});
