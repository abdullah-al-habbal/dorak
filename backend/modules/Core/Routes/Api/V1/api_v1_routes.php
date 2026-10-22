<?php

// root/modules/Core/Routes/Api/V1/api_v1_routes.php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;
use Modules\Core\Http\Actions\Shared\HealthCheckAction;
use Modules\Core\Http\Actions\Shared\ListNotificationsAction;
use Modules\Core\Http\Actions\Shared\MarkAllNotificationsReadAction;
use Modules\Core\Http\Actions\Shared\MarkNotificationReadAction;
use Modules\Core\Http\Actions\Shared\RegisterDeviceTokenAction;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::get('/health', HealthCheckAction::class)->name('health');
    Route::middleware(['auth:client,barber,branch_api,admin_api', EnsureClientAccountAccess::class])->post('/user/device-token', RegisterDeviceTokenAction::class)->name('device-token.register');
    Route::middleware(['auth:client,barber,branch_api', EnsureClientAccountAccess::class])
        ->prefix('notifications')
        ->name('notifications.')
        ->group(function (): void {
            Route::get('/', ListNotificationsAction::class)->name('index');
            Route::post('/read-all', MarkAllNotificationsReadAction::class)->name('read-all');
            Route::patch('/{notification}/read', MarkNotificationReadAction::class)->whereUuid('notification')->name('read');
        });
});
