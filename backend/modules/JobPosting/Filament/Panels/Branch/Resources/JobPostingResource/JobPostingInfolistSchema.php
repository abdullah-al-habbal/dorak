<?php

declare(strict_types=1);

namespace Modules\JobPosting\Filament\Panels\Branch\Resources\JobPostingResource;

use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;

final class JobPostingInfolistSchema
{
    public static function make(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make(__('jobposting::ui.job_posting'))
                ->columns(2)
                ->schema([
                    TextEntry::make('title.en')
                        ->label(__('jobposting::ui.title_english')),
                    TextEntry::make('title.ar')
                        ->label(__('jobposting::ui.title_arabic')),
                    TextEntry::make('description.en')
                        ->label(__('jobposting::ui.description_english'))
                        ->columnSpanFull(),
                    TextEntry::make('description.ar')
                        ->label(__('jobposting::ui.description_arabic'))
                        ->columnSpanFull(),
                    TextEntry::make('status')
                        ->badge()
                        ->color(fn (string $state): string => match ($state) {
                            'open' => 'success',
                            'closed' => 'danger',
                            'archived' => 'gray',
                            default => 'gray',
                        }),
                    TextEntry::make('applications_count')
                        ->counts('applications')
                        ->label(__('jobposting::ui.applications')),
                    TextEntry::make('created_at')
                        ->dateTime(),
                ]),
        ]);
    }
}
