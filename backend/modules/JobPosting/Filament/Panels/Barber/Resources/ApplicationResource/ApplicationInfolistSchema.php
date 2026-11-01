<?php

declare(strict_types=1);

namespace Modules\JobPosting\Filament\Panels\Barber\Resources\ApplicationResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ApplicationInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('jobposting::ui.application_details'))
                ->columns(2)
                ->schema([
                    TextEntry::make('jobPosting.title.en')
                        ->label(__('jobposting::ui.job_posting')),
                    TextEntry::make('status')
                        ->badge(),
                    TextEntry::make('profile_snapshot')
                        ->label(__('jobposting::ui.profile_snapshot')),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
