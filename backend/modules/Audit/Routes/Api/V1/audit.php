<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Audit\Http\Actions\Admin\ListStatusChangeLogsAction;

Route::middleware('auth:admin_api')->prefix('admin/audit')->group(function (): void {
    Route::get('/{subjectType}/{subjectId}', ListStatusChangeLogsAction::class);
});
