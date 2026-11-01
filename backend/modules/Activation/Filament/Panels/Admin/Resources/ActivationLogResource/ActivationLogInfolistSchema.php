<?php

declare(strict_types=1);

namespace Modules\Activation\Filament\Panels\Admin\Resources\ActivationLogResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ActivationLogInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('activable_type')
                        ->label(__('activation::ui.entity_type')),
                    TextEntry::make('activable_id')
                        ->label(__('activation::ui.entity_id')),
                    TextEntry::make('status')
                        ->badge(),
                    TextEntry::make('reason'),
                    TextEntry::make('admin.email')
                        ->label(__('activation::ui.admin')),
                    TextEntry::make('activated_at')
                        ->dateTime(),
                    TextEntry::make('expires_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
