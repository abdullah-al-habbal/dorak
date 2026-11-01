<?php

declare(strict_types=1);

namespace Modules\Booking\Filament\Panels\Branch\Resources\BookingResource;

use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

final class BookingsTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('client.name.en')
                    ->label(__('booking::ui.client')),
                TextColumn::make('barber.name.en')
                    ->label(__('booking::ui.barber')),
                TextColumn::make('chair.label')
                    ->label(__('booking::ui.chair')),
                TextColumn::make('time_slot')
                    ->dateTime(),
                TextColumn::make('status')
                    ->badge(),
            ])
            ->actions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->bulkActions([]);
    }
}
