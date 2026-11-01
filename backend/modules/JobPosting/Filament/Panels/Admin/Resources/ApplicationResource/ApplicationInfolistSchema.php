<?php

declare(strict_types=1);

namespace Modules\JobPosting\Filament\Panels\Admin\Resources\ApplicationResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ApplicationInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextEntry::make('jobPosting.title.en')
                        ->label(__('jobposting::ui.job_posting')),
                    TextEntry::make('barber.email')
                        ->label(__('jobposting::ui.barber')),
                    TextEntry::make('status')
                        ->badge(),
                ]),
        ]);
    }
}
