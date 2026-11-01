<?php

declare(strict_types=1);

namespace Modules\Chair\Filament\Panels\Branch\Resources\ChairResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ChairInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('chair::ui.chair'))
                ->columns(2)
                ->schema([
                    TextEntry::make('label'),
                    TextEntry::make('barber.name.en')
                        ->label(__('chair::ui.barber'))
                        ->placeholder(__('chair::ui.unassigned')),
                    TextEntry::make('status')
                        ->badge(),
                    TextEntry::make('updated_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
