<?php

declare(strict_types=1);

namespace Modules\Chair\Filament\Panels\Admin\Resources\ChairResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ChairInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('label'),
                    TextEntry::make('branch.name.en')
                        ->label(__('chair::ui.branch')),
                    TextEntry::make('barber.email')
                        ->label(__('chair::ui.barber')),
                    TextEntry::make('status')
                        ->badge()
                        ->color(fn (string $state): string => match ($state) {
                            'active' => 'success',
                            'occupied' => 'warning',
                            default => 'gray',
                        }),
                ]),
        ]);
    }
}
