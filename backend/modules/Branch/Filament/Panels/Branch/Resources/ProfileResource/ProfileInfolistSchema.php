<?php

declare(strict_types=1);

namespace Modules\Branch\Filament\Panels\Branch\Resources\ProfileResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ProfileInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('branch::ui.profile'))
                ->columns(2)
                ->schema([
                    TextEntry::make('name.en')
                        ->label(__('branch::ui.name_english')),
                    TextEntry::make('name.ar')
                        ->label(__('branch::ui.name_arabic')),
                    TextEntry::make('email'),
                    TextEntry::make('phone'),
                    TextEntry::make('status')
                        ->badge(),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
