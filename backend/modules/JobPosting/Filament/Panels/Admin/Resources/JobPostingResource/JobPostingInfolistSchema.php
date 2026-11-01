<?php

declare(strict_types=1);

namespace Modules\JobPosting\Filament\Panels\Admin\Resources\JobPostingResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class JobPostingInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('title.en')
                        ->label(__('jobposting::ui.title_english')),
                    TextEntry::make('title.ar')
                        ->label(__('jobposting::ui.title_arabic')),
                    TextEntry::make('branch.name.en')
                        ->label(__('jobposting::ui.branch')),
                    TextEntry::make('status')
                        ->badge(),
                    TextEntry::make('description.en')
                        ->label(__('jobposting::ui.description'))
                        ->html(),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
