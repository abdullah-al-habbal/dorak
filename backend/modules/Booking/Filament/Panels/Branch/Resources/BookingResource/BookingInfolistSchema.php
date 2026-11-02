<?php

declare(strict_types=1);

namespace Modules\Booking\Filament\Panels\Branch\Resources\BookingResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class BookingInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('booking::ui.booking'))
                ->columns(2)
                ->schema([
                    TextEntry::make('client.name.en')
                        ->label(__('booking::ui.client')),
                    TextEntry::make('barber.name.en')
                        ->label(__('booking::ui.barber')),
                    TextEntry::make('chair.label')
                        ->label(__('booking::ui.chair')),
                    TextEntry::make('starts_at')
                        ->dateTime(),
                    TextEntry::make('booking_status')
                        ->badge(),
                ]),
        ]);
    }
}
