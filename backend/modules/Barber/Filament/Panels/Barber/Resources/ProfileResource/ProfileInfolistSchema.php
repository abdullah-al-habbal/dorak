<?php

declare(strict_types=1);

namespace Modules\Barber\Filament\Panels\Barber\Resources\ProfileResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ProfileInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('barber::ui.profile'))
                ->columns(2)
                ->schema([
                    TextEntry::make('name.en')
                        ->label(__('barber::ui.name_english')),
                    TextEntry::make('name.ar')
                        ->label(__('barber::ui.name_arabic')),
                    TextEntry::make('email'),
                    TextEntry::make('status')
                        ->badge()
                        ->color(fn (string $state): string => match ($state) {
                            'enabled' => 'success',
                            'disabled' => 'danger',
                            default => 'warning',
                        }),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
