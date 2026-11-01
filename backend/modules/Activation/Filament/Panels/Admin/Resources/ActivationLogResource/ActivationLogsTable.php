<?php

declare(strict_types=1);

namespace Modules\Activation\Filament\Panels\Admin\Resources\ActivationLogResource;

use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

final class ActivationLogsTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('activable_type')
                    ->label(__('activation::ui.type'))
                    ->searchable(),
                TextColumn::make('activable_id')
                    ->label(__('activation::ui.entity_id'))
                    ->searchable(),
                TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state): string => $state?->value ?? 'unknown'),
                TextColumn::make('admin.email')
                    ->label(__('activation::ui.admin')),
                TextColumn::make('activated_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                ViewAction::make(),
            ])
            ->bulkActions([]);
    }
}
