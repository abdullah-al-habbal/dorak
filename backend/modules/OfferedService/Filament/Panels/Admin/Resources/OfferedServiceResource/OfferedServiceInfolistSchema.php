<?php

declare(strict_types=1);

namespace Modules\OfferedService\Filament\Panels\Admin\Resources\OfferedServiceResource;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class OfferedServiceInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('name.en')
                        ->label(__('offeredservice::ui.name_english')),
                    TextEntry::make('name.ar')
                        ->label(__('offeredservice::ui.name_arabic')),
                    TextEntry::make('serviceable_type')
                        ->label(__('offeredservice::ui.entity_type')),
                    TextEntry::make('currency.code')
                        ->label(__('offeredservice::ui.currency')),
                    TextEntry::make('price_amount_minor'),
                    TextEntry::make('duration_minutes')
                        ->suffix(' min'),
                    IconEntry::make('is_at_home')
                        ->boolean(),
                    IconEntry::make('is_active')
                        ->boolean(),
                    TextEntry::make('description.en')
                        ->label(__('offeredservice::ui.description'))
                        ->html(),
                ]),
        ]);
    }
}
