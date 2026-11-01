<?php

declare(strict_types=1);

namespace Modules\OfferedService\Filament\Panels\Barber\Resources\OfferedServiceResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class OfferedServiceInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('offeredservice::ui.service_details'))
                ->columns(2)
                ->schema([
                    TextEntry::make('name.en')
                        ->label(__('offeredservice::ui.name_english')),
                    TextEntry::make('name.ar')
                        ->label(__('offeredservice::ui.name_arabic')),
                    TextEntry::make('price_amount_minor'),
                    TextEntry::make('currency.code')
                        ->label(__('offeredservice::ui.currency')),
                    TextEntry::make('duration')
                        ->label(__('offeredservice::ui.duration_minutes')),
                    TextEntry::make('is_at_home')
                        ->label(__('offeredservice::ui.available_at_home'))
                        ->boolean(),
                    TextEntry::make('is_active')
                        ->boolean(),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
