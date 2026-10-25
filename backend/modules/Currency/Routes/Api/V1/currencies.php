<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Currency\Http\Actions\Shared\ConvertCurrencyAction;
use Modules\Currency\Http\Actions\Shared\ListCurrenciesAction;
use Modules\Currency\Http\Actions\Shared\ListExchangeRatesAction;

Route::get('/currencies', ListCurrenciesAction::class)->name('currencies.list');

Route::middleware('throttle:60,1')->group(function (): void {
    Route::get('/exchange-rates', ListExchangeRatesAction::class)->name('exchange-rates.list');
    Route::get('/currency/convert', ConvertCurrencyAction::class)->name('currencies.convert');
});
