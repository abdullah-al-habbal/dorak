<?php

declare(strict_types=1);

namespace Modules\Client\Filament\Panels\Admin\Resources\ClientResource;

use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Modules\Activation\Filament\Actions\ToggleActivationAction;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;
use Modules\Client\Services\ClientAccountDeletion;

final class ClientsTable
{
    public static function make(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name.en')
                    ->label(__('client::ui.name'))
                    ->searchable(),
                TextColumn::make('email')
                    ->searchable(),
                TextColumn::make('phone'),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (ClientStatusEnum $state): string => match ($state) {
                        ClientStatusEnum::Enabled => 'success',
                        ClientStatusEnum::Disabled => 'danger',
                        ClientStatusEnum::Pending => 'warning',
                    }),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->actions([
                ViewAction::make(),
                EditAction::make(),
                ToggleActivationAction::make(),
                DeleteAction::make()
                    ->using(fn (ClientModel $record, ClientAccountDeletion $deletion): bool => $deletion->delete($record))
                    ->failureNotificationTitle(__('client::ui.delete_blocked_active_bookings')),
            ])
            ->bulkActions([]);
    }
}
