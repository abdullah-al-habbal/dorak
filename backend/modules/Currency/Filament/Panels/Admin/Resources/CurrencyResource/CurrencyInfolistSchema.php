<?php

declare(strict_types=1);

namespace Modules\Currency\Filament\Panels\Admin\Resources\CurrencyResource;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class CurrencyInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('code'),
                    TextEntry::make('name.en')
                        ->label(__('currency::ui.name_english')),
                    TextEntry::make('name.ar')
                        ->label(__('currency::ui.name_arabic')),
                    TextEntry::make('symbol'),
                    IconEntry::make('is_default')
                        ->boolean(),
                ]),
        ]);
    }
}
