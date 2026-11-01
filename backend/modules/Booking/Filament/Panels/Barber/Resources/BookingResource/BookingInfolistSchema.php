<?php

declare(strict_types=1);

namespace Modules\Booking\Filament\Panels\Barber\Resources\BookingResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class BookingInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('booking::ui.booking_details'))
                ->columns(2)
                ->schema([
                    TextEntry::make('client.name.en')
                        ->label(__('booking::ui.client')),
                    TextEntry::make('chair.name')
                        ->label(__('booking::ui.chair')),
                    TextEntry::make('time_slot')
                        ->dateTime(),
                    TextEntry::make('status')
                        ->badge(),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
