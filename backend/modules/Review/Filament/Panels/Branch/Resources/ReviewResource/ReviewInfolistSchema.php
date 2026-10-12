<?php

declare(strict_types=1);

namespace Modules\Review\Filament\Panels\Branch\Resources\ReviewResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ReviewInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('review::ui.review'))
                ->columns(2)
                ->schema([
                    TextEntry::make('author.name.en')
                        ->label(__('review::ui.client')),
                    TextEntry::make('booking.id')
                        ->label(__('review::ui.booking_reference')),
                    TextEntry::make('rating')
                        ->label(__('review::ui.rating'))
                        ->icon('heroicon-m-star')
                        ->iconColor('warning'),
                    TextEntry::make('created_at')
                        ->dateTime()
                        ->label(__('review::ui.date')),
                    TextEntry::make('comment')
                        ->label(__('review::ui.comment'))
                        ->columnSpanFull(),
                ]),
        ]);
    }
}
