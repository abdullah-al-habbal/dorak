<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Filament\Panels\Admin\Resources\ServiceCatalogCategoryResource;

use Filament\Notifications\Notification;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Support\CatalogCategoryUsage;

final class ServiceCatalogCategoriesTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name.en')
                    ->label(__('servicecatalog::ui.name'))
                    ->searchable(),
                TextColumn::make('slug')
                    ->searchable(),
                TextColumn::make('items_count')
                    ->label(__('servicecatalog::ui.items'))
                    ->counts('items'),
                ToggleColumn::make('is_active'),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->actions([
                ViewAction::make(),
                EditAction::make(),
                self::deleteAction(),
            ])
            ->bulkActions([]);
    }

    /**
     * Same rule as the dashboard: only an empty category is deleted. The action is hidden for a
     * category in use, and `before` re-checks and halts in case it changed after the page loaded.
     */
    private static function deleteAction(): DeleteAction
    {
        return DeleteAction::make()
            ->hidden(fn (ServiceCatalogCategoryModel $record): bool => ! app(CatalogCategoryUsage::class)->isEmpty($record))
            ->before(function (DeleteAction $action, ServiceCatalogCategoryModel $record): void {
                if (app(CatalogCategoryUsage::class)->isEmpty($record)) {
                    return;
                }
                Notification::make()->danger()->title(__('servicecatalog::messages.category_in_use'))->send();
                $action->halt();
            });
    }
}
