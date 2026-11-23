<?php

// root/modules/Core/Routes/Api/V1/api_v1_routes.php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Branch\Http\Middleware\EnsureBranchAccountAccess;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;
use Modules\Core\Http\Actions\Shared\HealthCheckAction;
use Modules\Core\Http\Actions\Shared\ListNotificationsAction;
use Modules\Core\Http\Actions\Shared\MarkAllNotificationsReadAction;
use Modules\Core\Http\Actions\Shared\MarkNotificationReadAction;
use Modules\Core\Http\Actions\Shared\RegisterDeviceTokenAction;
use Modules\Core\Http\Actions\Shared\RevokeDeviceTokenAction;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::get('/health', HealthCheckAction::class)->name('health');
    Route::middleware(['auth:client,barber,branch_api,admin_api', EnsureClientAccountAccess::class, EnsureBranchAccountAccess::class])
        ->prefix('user/device-token')
        ->name('device-token.')
        ->group(function (): void {
            Route::post('/', RegisterDeviceTokenAction::class)->name('register');
            Route::delete('/', RevokeDeviceTokenAction::class)->name('revoke');
        });
    Route::middleware(['auth:client,barber,branch_api', EnsureClientAccountAccess::class, EnsureBranchAccountAccess::class])
        ->prefix('notifications')
        ->name('notifications.')
        ->group(function (): void {
            Route::get('/', ListNotificationsAction::class)->name('index');
            Route::post('/read-all', MarkAllNotificationsReadAction::class)->name('read-all');
            Route::patch('/{notification}/read', MarkNotificationReadAction::class)->whereUuid('notification')->name('read');
        });
});
