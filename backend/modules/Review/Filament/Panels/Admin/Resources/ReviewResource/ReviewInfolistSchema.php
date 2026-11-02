<?php

declare(strict_types=1);

namespace Modules\Review\Filament\Panels\Admin\Resources\ReviewResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ReviewInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('booking_id')
                        ->label(__('review::ui.booking')),
                    TextEntry::make('author.email')
                        ->label(__('review::ui.author')),
                    TextEntry::make('author_type')
                        ->label(__('review::ui.author_type')),
                    TextEntry::make('subject_type')
                        ->label(__('review::ui.subject_type')),
                    TextEntry::make('rating')
                        ->badge()
                        ->color(fn (int $state): string => match (true) {
                            $state >= 4 => 'success',
                            $state >= 3 => 'warning',
                            default => 'danger',
                        }),
                    TextEntry::make('body')
                        ->columnSpanFull(),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
