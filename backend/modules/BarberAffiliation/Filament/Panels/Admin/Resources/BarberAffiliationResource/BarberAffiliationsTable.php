<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Filament\Panels\Admin\Resources\BarberAffiliationResource;

use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

final class BarberAffiliationsTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('barber.email')
                    ->label(__('barberaffiliation::ui.barber'))
                    ->searchable(),
                TextColumn::make('affiliable_type')
                    ->label(__('barberaffiliation::ui.entity_type')),
                TextColumn::make('status')
                    ->badge(),
                TextColumn::make('commission_percent')
                    ->suffix('%'),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->actions([
                ViewAction::make(),
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([]);
    }
}
