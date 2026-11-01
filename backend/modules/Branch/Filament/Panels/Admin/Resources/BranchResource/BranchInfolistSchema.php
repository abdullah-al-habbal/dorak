<?php

declare(strict_types=1);

namespace Modules\Branch\Filament\Panels\Admin\Resources\BranchResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class BranchInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('branch::ui.branch_details'))
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
