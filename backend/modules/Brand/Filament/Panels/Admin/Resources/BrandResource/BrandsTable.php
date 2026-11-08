<?php

declare(strict_types=1);

namespace Modules\Brand\Filament\Panels\Admin\Resources\BrandResource;

use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Modules\Activation\Filament\Actions\ToggleActivationAction;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;

final class BrandsTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name.en')
                    ->label(__('brand::ui.name'))
                    ->searchable(),
                TextColumn::make('owner.email')
                    ->label(__('brand::ui.owner'))
                    ->searchable(),
                TextColumn::make('status')
                    ->label(__('brand::ui.status'))
                    ->badge(),
                TextColumn::make('baseCurrency.code')
                    ->label(__('brand::ui.currency')),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->actions([
                Action::make('approve')
                    ->label(__('brand::ui.approve'))
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    // The same `BrandPolicy::approve` gate as `PATCH /dashboard/admin/brands/{brand}/approve`.
                    ->authorize('approve')
                    ->visible(fn (BrandModel $record): bool => ! $record->isActive())
                    ->action(fn (BrandModel $record) => $record->update(['status' => BrandStatusEnum::Active])),
                ViewAction::make(),
                EditAction::make(),
                ToggleActivationAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([]);
    }
}
