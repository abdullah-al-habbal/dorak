<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\ServiceCatalog\Http\Actions\Shared\ListCatalogItemsAction;
use Modules\ServiceCatalog\Http\Actions\Shared\ListCategoriesAction;
use Modules\ServiceCatalog\Http\Actions\Shared\ShowCatalogItemAction;

Route::get('/service-catalog/items', ListCatalogItemsAction::class)->name('service-catalog.items.list');
Route::get('/service-catalog/items/{id}', ShowCatalogItemAction::class)->name('service-catalog.items.show');
Route::get('/service-catalog/categories', ListCategoriesAction::class)->name('service-catalog.categories.list');
