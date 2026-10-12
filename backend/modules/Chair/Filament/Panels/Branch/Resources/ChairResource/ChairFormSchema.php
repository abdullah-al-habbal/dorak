<?php

declare(strict_types=1);

namespace Modules\Chair\Filament\Panels\Branch\Resources\ChairResource;

use Filament\Forms\Components\JSONInput;
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
            Section::make(__('chair::ui.chair'))
                ->columns(2)
                ->schema([
                    TextInput::make('label')
                        ->required(),
                    Select::make('barber_id')
                        ->label(__('chair::ui.barber'))
                        ->relationship('barber', 'name.en')
                        ->searchable()
                        ->preload()
                        ->nullable(),
                    Select::make('status')
                        ->options(ChairStatus::class)
                        ->required()
                        ->default(ChairStatus::Available),
                    JSONInput::make('ui_metadata')
                        ->label(__('chair::ui.ui_metadata'))
                        ->nullable(),
                ]),
        ]);
    }
}
