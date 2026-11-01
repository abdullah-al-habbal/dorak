<?php

declare(strict_types=1);

namespace Modules\Booking\Filament\Panels\Admin\Resources\BookingResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class BookingInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('client.email')
                        ->label(__('booking::ui.client')),
                    TextEntry::make('chair.label')
                        ->label(__('booking::ui.chair')),
                    TextEntry::make('barber.email')
                        ->label(__('booking::ui.barber')),
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
