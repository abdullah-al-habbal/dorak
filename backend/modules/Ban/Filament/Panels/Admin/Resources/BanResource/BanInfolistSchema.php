<?php

declare(strict_types=1);

namespace Modules\Ban\Filament\Panels\Admin\Resources\BanResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class BanInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('bannable_type')
                        ->label(__('ban::ui.entity_type')),
                    TextEntry::make('bannable_id')
                        ->label(__('ban::ui.entity_id')),
                    TextEntry::make('reason'),
                    TextEntry::make('banned_at')
                        ->dateTime(),
                    TextEntry::make('expires_at')
                        ->dateTime()
                        ->default('Permanent'),
                    TextEntry::make('admin.email')
                        ->label(__('ban::ui.banned_by')),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
