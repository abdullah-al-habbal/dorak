<?php

declare(strict_types=1);

namespace Modules\JobPosting\Filament\Panels\Barber\Resources\ApplicationResource;

use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

final class ApplicationTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('jobPosting.title.en')
                    ->label(__('jobposting::ui.job_title')),
                TextColumn::make('status')
                    ->badge(),
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
