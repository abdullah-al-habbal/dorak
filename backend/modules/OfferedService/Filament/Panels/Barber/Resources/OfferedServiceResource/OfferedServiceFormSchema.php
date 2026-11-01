<?php

declare(strict_types=1);

namespace Modules\OfferedService\Filament\Panels\Barber\Resources\OfferedServiceResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;

final class OfferedServiceFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make(__('offeredservice::ui.service_details'))
                ->columns(2)
                ->schema([
                    TextInput::make('name.en')
                        ->label(__('offeredservice::ui.name_english'))
                        ->required(),
                    TextInput::make('name.ar')
                        ->label(__('offeredservice::ui.name_arabic'))
                        ->required(),
                    TextInput::make('price')
                        ->numeric()
                        ->required(),
                    Select::make('currency_code')
                        ->relationship('currency', 'code')
                        ->required(),
                    TextInput::make('duration')
                        ->numeric()
                        ->label(__('offeredservice::ui.duration_minutes'))
                        ->required(),
                    Toggle::make('is_at_home')
                        ->label(__('offeredservice::ui.available_at_home')),
                    Toggle::make('is_active')
                        ->label(__('offeredservice::ui.active'))
                        ->default(true),
                ]),
        ]);
    }
}
