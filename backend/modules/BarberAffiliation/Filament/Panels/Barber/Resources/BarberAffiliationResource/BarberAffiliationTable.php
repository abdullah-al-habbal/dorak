<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Filament\Panels\Barber\Resources\BarberAffiliationResource;

use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

final class BarberAffiliationTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('affiliable')
                    ->label(__('barberaffiliation::ui.branch_brand')),
                TextColumn::make('status')
                    ->badge(),
                TextColumn::make('commission_rate')
                    ->label(__('barberaffiliation::ui.commission')),
                TextColumn::make('invited_at')
                    ->dateTime(),
                TextColumn::make('accepted_at')
                    ->dateTime(),
            ])
            ->actions([
                ViewAction::make(),
            ])
            ->bulkActions([]);
    }
}
