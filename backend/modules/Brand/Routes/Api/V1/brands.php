<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Brand\Http\Actions\Admin\GetBrandFeaturesAction;
use Modules\Brand\Http\Actions\Admin\UpdateBrandFeaturesAction;
use Modules\Brand\Http\Actions\Client\CreateBrandAction;
use Modules\Brand\Http\Actions\Client\UpdateBrandAction;
use Modules\Brand\Http\Actions\Shared\ListBrandsAction;
use Modules\Brand\Http\Actions\Shared\ShowBrandAction;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;

Route::get('/brands', ListBrandsAction::class)->name('brands.list');
Route::get('/brands/{brand}', ShowBrandAction::class)->name('brands.show');

Route::middleware(['auth:client', EnsureClientAccountAccess::class])->group(function (): void {
    Route::post('/brands', CreateBrandAction::class)->name('brands.create');
    Route::put('/brands/{brand}', UpdateBrandAction::class)->name('brands.update');
});

Route::middleware('auth:admin_api')->group(function (): void {
    Route::get('/admin/brands/{brand}/features', GetBrandFeaturesAction::class)->name('admin.brands.features.show');
    Route::patch('/admin/brands/{brand}/features', UpdateBrandFeaturesAction::class)->name('admin.brands.features.update');
});
