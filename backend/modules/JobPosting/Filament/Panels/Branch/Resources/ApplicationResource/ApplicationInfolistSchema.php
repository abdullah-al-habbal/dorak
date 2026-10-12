<?php

declare(strict_types=1);

namespace Modules\JobPosting\Filament\Panels\Branch\Resources\ApplicationResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class ApplicationInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('jobposting::ui.application'))
                ->columns(2)
                ->schema([
                    TextEntry::make('barber.name.en')
                        ->label(__('jobposting::ui.barber')),
                    TextEntry::make('jobPosting.title.en')
                        ->label(__('jobposting::ui.job_title')),
                    TextEntry::make('status')
                        ->badge()
                        ->color(fn (string $state): string => match ($state) {
                            'submitted' => 'warning',
                            'reviewed' => 'info',
                            'accepted' => 'success',
                            'rejected' => 'danger',
                            default => 'gray',
                        }),
                    TextEntry::make('created_at')
                        ->dateTime()
                        ->label(__('jobposting::ui.applied')),
                ]),
            Section::make(__('jobposting::ui.profile_snapshot'))
                ->schema([
                    TextEntry::make('profile_snapshot')
                        ->label(__('jobposting::ui.snapshot'))
                        ->json(),
                ]),
        ]);
    }
}
