<?php

declare(strict_types=1);

namespace Modules\Ban\Filament\Panels\Admin\Resources\BanResource;

use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

final class BansTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('bannable_type')
                    ->label(__('ban::ui.type'))
                    ->searchable(),
                TextColumn::make('bannable_id')
                    ->label(__('ban::ui.entity_id'))
                    ->searchable(),
                TextColumn::make('reason')
                    ->limit(30),
                TextColumn::make('banned_at')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('expires_at')
                    ->dateTime()
                    ->placeholder(__('ban::ui.permanent')),
                TextColumn::make('admin.email')
                    ->label(__('ban::ui.banned_by')),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                ViewAction::make(),
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([]);
    }
}
