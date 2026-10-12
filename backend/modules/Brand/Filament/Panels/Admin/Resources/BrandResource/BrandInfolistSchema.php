<?php

declare(strict_types=1);

namespace Modules\Brand\Filament\Panels\Admin\Resources\BrandResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class BrandInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('name.en')
                        ->label(__('brand::ui.name_english')),
                    TextEntry::make('name.ar')
                        ->label(__('brand::ui.name_arabic')),
                    TextEntry::make('owner.email')
                        ->label(__('brand::ui.owner')),
                    TextEntry::make('baseCurrency.code')
                        ->label(__('brand::ui.base_currency')),
                    TextEntry::make('description.en')
                        ->label(__('brand::ui.description'))
                        ->html(),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
