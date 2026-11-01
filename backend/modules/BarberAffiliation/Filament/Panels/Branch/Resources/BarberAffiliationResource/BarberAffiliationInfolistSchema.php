<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Filament\Panels\Branch\Resources\BarberAffiliationResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class BarberAffiliationInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('barberaffiliation::ui.affiliation'))
                ->columns(2)
                ->schema([
                    TextEntry::make('barber.name.en')
                        ->label(__('barberaffiliation::ui.barber')),
                    TextEntry::make('status')
                        ->badge(),
                    TextEntry::make('commission_rate')
                        ->label(__('barberaffiliation::ui.commission_rate')),
                    TextEntry::make('invited_at')
                        ->dateTime()
                        ->label(__('barberaffiliation::ui.invited')),
                    TextEntry::make('accepted_at')
                        ->dateTime()
                        ->label(__('barberaffiliation::ui.accepted')),
                    TextEntry::make('terminated_at')
                        ->dateTime()
                        ->label(__('barberaffiliation::ui.terminated')),
                ]),
        ]);
    }
}
