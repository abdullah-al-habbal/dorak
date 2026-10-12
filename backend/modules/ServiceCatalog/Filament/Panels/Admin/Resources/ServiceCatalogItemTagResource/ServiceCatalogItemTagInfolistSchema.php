<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Filament\Panels\Admin\Resources\ServiceCatalogItemTagResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ServiceCatalogItemTagInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('name.en')
                        ->label(__('servicecatalog::ui.name_english')),
                    TextEntry::make('name.ar')
                        ->label(__('servicecatalog::ui.name_arabic')),
                    TextEntry::make('slug'),
                    TextEntry::make('group'),
                    TextEntry::make('is_active')
                        ->label(__('servicecatalog::ui.active')),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
