<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;
use Modules\ClientHistory\Http\Actions\Client\AttachHistoryMediaAction;
use Modules\ClientHistory\Http\Actions\Client\ListClientServiceHistoryAction;
use Modules\ClientHistory\Http\Actions\Client\RebookFromHistoryAction;

Route::middleware(['auth:client', EnsureClientAccountAccess::class])->group(function () {
    Route::get('/client/history', ListClientServiceHistoryAction::class)->name('client.history.index');
    Route::post('/client/history/{history}/media', AttachHistoryMediaAction::class)->name('client.history.media.attach');
    Route::post('/client/history/{history}/rebook', RebookFromHistoryAction::class)->name('client.history.rebook');
});
