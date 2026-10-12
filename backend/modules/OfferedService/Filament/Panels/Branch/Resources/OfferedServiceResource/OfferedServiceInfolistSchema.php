<?php

declare(strict_types=1);

namespace Modules\OfferedService\Filament\Panels\Branch\Resources\OfferedServiceResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Modules\OfferedService\Models\OfferedServiceModel;

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
                    TextEntry::make('price')
                        ->money(fn (OfferedServiceModel $record): string => $record->currency->code ?? 'USD'),
                    TextEntry::make('duration')
                        ->label(__('offeredservice::ui.duration_minutes')),
                    TextEntry::make('at_home')
                        ->label(__('offeredservice::ui.at_home'))
                        ->boolean(),
                    TextEntry::make('active')
                        ->boolean(),
                ]),
        ]);
    }
}
