<?php

declare(strict_types=1);

namespace Modules\JobPosting\Filament\Panels\Branch\Resources\ApplicationResource;

use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

final class ApplicationsTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('barber.name.en')
                    ->label(__('jobposting::ui.barber')),
                TextColumn::make('jobPosting.title.en')
                    ->label(__('jobposting::ui.job_title')),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'submitted' => 'warning',
                        'reviewed' => 'info',
                        'accepted' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->label(__('jobposting::ui.applied')),
            ])
            ->actions([
                ViewAction::make(),
            ])
            ->bulkActions([]);
    }
}
