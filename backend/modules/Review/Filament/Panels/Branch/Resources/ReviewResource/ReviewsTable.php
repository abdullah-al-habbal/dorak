<?php

declare(strict_types=1);

namespace Modules\Review\Filament\Panels\Branch\Resources\ReviewResource;

use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

final class ReviewsTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('author.name.en')
                    ->label(__('review::ui.client')),
                TextColumn::make('rating')
                    ->label(__('review::ui.rating'))
                    ->icon('heroicon-m-star')
                    ->iconColor('warning'),
                TextColumn::make('comment')
                    ->limit(50),
                TextColumn::make('booking.id')
                    ->label(__('review::ui.booking'))
                    ->limit(10),
                TextColumn::make('created_at')
                    ->dateTime(),
            ])
            ->actions([
                ViewAction::make(),
            ])
            ->bulkActions([]);
    }
}
