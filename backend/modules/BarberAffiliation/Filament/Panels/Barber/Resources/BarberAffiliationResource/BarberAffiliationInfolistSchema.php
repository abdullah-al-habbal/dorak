<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Filament\Panels\Barber\Resources\BarberAffiliationResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class BarberAffiliationInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('barberaffiliation::ui.affiliation_details'))
                ->columns(2)
                ->schema([
                    TextEntry::make('affiliable')
                        ->label(__('barberaffiliation::ui.branch_brand')),
                    TextEntry::make('status')
                        ->badge(),
                    TextEntry::make('commission_rate')
                        ->label(__('barberaffiliation::ui.commission_rate')),
                    TextEntry::make('invited_at')
                        ->dateTime(),
                    TextEntry::make('accepted_at')
                        ->dateTime(),
                    TextEntry::make('terminated_at')
                        ->dateTime(),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
