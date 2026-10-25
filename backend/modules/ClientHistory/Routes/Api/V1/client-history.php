<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Barber\Http\Middleware\EnsureBarberAccountAccess;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;
use Modules\ClientHistory\Http\Actions\Barber\ListClientHistoryForBarberAction;
use Modules\ClientHistory\Http\Actions\Barber\UpdateHistoryNotesAction;
use Modules\ClientHistory\Http\Actions\Client\AttachHistoryMediaAction;
use Modules\ClientHistory\Http\Actions\Client\ListClientServiceHistoryAction;
use Modules\ClientHistory\Http\Actions\Client\RebookFromHistoryAction;
use Modules\ClientHistory\Http\Actions\Client\ShowHistoryMediaPhotoAction;
use Modules\ClientHistory\Http\Actions\Client\UpdateClientHistoryAction;

Route::middleware(['auth:client', EnsureClientAccountAccess::class])->group(function () {
    Route::get('/client/history', ListClientServiceHistoryAction::class)->name('client.history.index');
    Route::patch('/client/history/{history}', UpdateClientHistoryAction::class)->name('client.history.update');
    Route::post('/client/history/{history}/media', AttachHistoryMediaAction::class)->name('client.history.media.attach');
    Route::post('/client/history/{history}/rebook', RebookFromHistoryAction::class)->name('client.history.rebook');
});

Route::get('/client/history/media/{media}/photo', ShowHistoryMediaPhotoAction::class)
    ->middleware('signed')
    ->name('client.history.media.photo');

Route::middleware(['auth:barber', EnsureBarberAccountAccess::class])->group(function () {
    Route::get('/barber/clients/{client}/history', ListClientHistoryForBarberAction::class)->name('barber.clients.history');
    Route::patch('/barber/history/{history}/notes', UpdateHistoryNotesAction::class)->name('barber.history.notes.update');
});
