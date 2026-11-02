<?php

declare(strict_types=1);

namespace Modules\Chair\Filament\Panels\Admin\Resources\ChairResource;

use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Modules\Chair\Enums\ChairStatus;

final class ChairFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    Select::make('branch_id')
                        ->relationship('branch', 'name.en')
                        ->required(),
                    Select::make('barber_id')
                        ->relationship('barber', 'email')
                        ->nullable(),
                    TextInput::make('label')
                        ->required(),
                    Select::make('status')
                        ->options(ChairStatus::class)
                        ->required(),
                    KeyValue::make('layout_settings'),
                ]),
        ]);
    }
}
