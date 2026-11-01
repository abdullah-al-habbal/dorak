<?php

declare(strict_types=1);

namespace Modules\Preference\Filament\Panels\Admin\Resources\PreferenceResource;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class PreferenceInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('preferenceable_type')
                        ->label(__('preference::ui.entity_type')),
                    TextEntry::make('preferenceable_id')
                        ->label(__('preference::ui.entity_id')),
                    TextEntry::make('preferred_language'),
                    TextEntry::make('displayCurrency.code')
                        ->label(__('preference::ui.display_currency')),
                    IconEntry::make('is_notification_enabled')
                        ->boolean(),
                    TextEntry::make('theme')
                        ->badge(),
                    TextEntry::make('price_display_mode')
                        ->badge(),
                ]),
        ]);
    }
}
